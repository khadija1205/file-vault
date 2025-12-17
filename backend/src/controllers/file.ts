import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { AppError } from '../types';
import { uploadToS3, deleteFromS3, getPresignedDownloadUrl } from '../utils/s3';
import { ShareFileInput } from '../schemas/file';
import crypto from 'crypto';

export const uploadFile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.file) {
            throw new AppError(400, 'No file provided');
        }

        const MAX_FILE_SIZE = 100 * 1024 * 1024;
        if (req.file.size > MAX_FILE_SIZE) {
            throw new AppError(400, 'File size exceeds 100MB limit');
        }

        const userId = req.userId!;

        const { key, url } = await uploadToS3(req.file, userId);

        const dbFile = await prisma.file.create({
            data: {
                filename: req.file.originalname,
                fileType: req.file.mimetype,
                fileSize: req.file.size,
                s3Key: key,
                s3Url: url,
                ownerId: userId,
                filebaseUrl: url
            }
        });

        res.status(201).json({
            message: 'File uploaded successfully',
            file: dbFile
        });
    } catch (error) {
        next(error);
    }
};

export const bulkUploadFiles = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.files || req.files.length === 0) {
            throw new AppError(400, 'No files provided');
        }

        const userId = req.userId!;
        const files = req.files as Express.Multer.File[];

        const successful: any[] = [];
        const failed: any[] = [];

        for (const file of files) {
            try {
                const MAX_FILE_SIZE = 100 * 1024 * 1024;
                if (file.size > MAX_FILE_SIZE) {
                    failed.push({
                        filename: file.originalname,
                        error: 'File size exceeds 100MB limit'
                    });
                    continue;
                }

                const { key, url } = await uploadToS3(file, userId);

                const dbFile = await prisma.file.create({
                    data: {
                        filename: file.originalname,
                        fileType: file.mimetype,
                        fileSize: file.size,
                        s3Key: key,
                        s3Url: url,
                        ownerId: userId,
                        filebaseUrl: url
                    }
                });

                successful.push({
                    id: dbFile.id,
                    filename: dbFile.filename,
                    fileType: dbFile.fileType,
                    fileSize: dbFile.fileSize,
                    s3Url: dbFile.s3Url,
                    createdAt: dbFile.createdAt
                });
            } catch (fileError) {
                failed.push({
                    filename: file.originalname,
                    error: fileError instanceof AppError ? fileError.message : 'Upload failed'
                });
            }
        }

        res.status(201).json({
            message: 'Bulk upload completed',
            successful,
            failed,
            stats: {
                total: files.length,
                successCount: successful.length,
                failureCount: failed.length
            }
        });
    } catch (error) {
        next(error);
    }
};

export const getUserFiles = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const files = await prisma.file.findMany({
            where: { ownerId: req.userId! },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                filename: true,
                fileType: true,
                fileSize: true,
                filebaseUrl: true,
                ownerId: true,
                createdAt: true
            }
        });

        res.json(files);
    } catch (error) {
        next(error);
    }
};

export const deleteFile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { fileId } = req.params;

        const file = await prisma.file.findUnique({ where: { id: fileId } });

        if (!file) {
            throw new AppError(404, 'File not found');
        }

        if (file.ownerId !== req.userId) {
            throw new AppError(403, 'Not authorized');
        }

        await deleteFromS3(file.s3Key);

        await prisma.file.delete({ where: { id: fileId } });

        res.json({ message: 'File deleted successfully' });
    } catch (error) {
        next(error);
    }
};

export const downloadFile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { fileId } = req.params;

        const file = await prisma.file.findUnique({ where: { id: fileId } });

        if (!file) {
            throw new AppError(404, 'File not found');
        }

        const presignedUrl = await getPresignedDownloadUrl(file.s3Key, 3600);

        res.json({
            downloadUrl: presignedUrl,
            filename: file.filename
        });
    } catch (error) {
        next(error);
    }
};
export const shareFileWithUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { fileId, userIds, expiryDays } = req.body as ShareFileInput;
        const ownerId = req.userId!;

        const file = await prisma.file.findUnique({ where: { id: fileId } });

        if (!file) {
            throw new AppError(404, 'File not found');
        }

        if (file.ownerId !== ownerId) {
            throw new AppError(403, 'Only owner can share this file');
        }

        const users = await prisma.user.findMany({
            where: { id: { in: userIds } }
        });

        if (users.length !== userIds.length) {
            throw new AppError(400, 'One or more users not found');
        }

        const validUserIds = userIds.filter((id) => id !== ownerId);

        if (validUserIds.length === 0) {
            throw new AppError(400, 'Cannot share with yourself');
        }

        const expiryDate =
            expiryDays && expiryDays > 0 ? new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000) : null;

        const shares = await Promise.all(
            validUserIds.map((userId) =>
                prisma.share.create({
                    data: {
                        fileId,
                        sharedById: ownerId,
                        sharedWithId: userId,
                        expiryDate,
                        shareLink: null
                    }
                })
            )
        );

        res.status(201).json({
            message: `File shared with ${shares.length} user(s)`,
            sharedCount: shares.length,
            shares: shares.map((s) => ({
                id: s.id,
                sharedWithId: s.sharedWithId,
                expiryDate: s.expiryDate
            }))
        });
    } catch (error) {
        next(error);
    }
};

export const getSharedWithMeFiles = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.userId!;

        const shares = await prisma.share.findMany({
            where: {
                sharedWithId: userId,
                OR: [{ expiryDate: null }, { expiryDate: { gt: new Date() } }]
            },
            include: {
                file: {
                    select: {
                        id: true,
                        filename: true,
                        fileType: true,
                        fileSize: true,
                        s3Url: true,
                        filebaseUrl: true,
                        createdAt: true,
                        owner: {
                            select: {
                                id: true,
                                username: true,
                                email: true
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        const formattedShares = shares.map((share) => ({
            shareId: share.id,
            file: share.file,
            sharedBy: share.file.owner,
            sharedAt: share.createdAt,
            expiresAt: share.expiryDate
        }));

        res.json({
            message: 'Files shared with you',
            count: formattedShares.length,
            files: formattedShares
        });
    } catch (error) {
        next(error);
    }
};

export const generateShareLink = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { fileId, expiryHours } = req.body;
        const userId = req.userId!;

        const file = await prisma.file.findUnique({ where: { id: fileId } });

        if (!file) {
            throw new AppError(404, 'File not found');
        }

        if (file.ownerId !== userId) {
            throw new AppError(403, 'Only owner can generate share link');
        }

        const shareLink = crypto.randomBytes(32).toString('hex');

        const expiryDate = expiryHours ? new Date(Date.now() + expiryHours * 60 * 60 * 1000) : null;

        const share = await prisma.share.create({
            data: {
                fileId,
                sharedById: userId,
                shareLink,
                expiryDate
            }
        });

        const shareUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/shared/${shareLink}`;

        res.status(201).json({
            message: 'Share link generated',
            shareLink: shareUrl,
            expiresAt: share.expiryDate,
            linkId: share.id
        });
    } catch (error) {
        next(error);
    }
};

export const accessShareLink = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { shareLink } = req.params;
        const userId = req.userId;

        const share = await prisma.share.findUnique({
            where: { shareLink },
            include: {
                file: {
                    select: {
                        id: true,
                        filename: true,
                        fileType: true,
                        fileSize: true,
                        s3Url: true,
                        filebaseUrl: true,
                        createdAt: true,
                        owner: {
                            select: {
                                id: true,
                                username: true,
                                email: true
                            }
                        }
                    }
                }
            }
        });

        if (!share) {
            throw new AppError(404, 'Invalid or expired share link');
        }

        if (share.expiryDate && new Date(share.expiryDate) < new Date()) {
            throw new AppError(403, 'Share link has expired');
        }

        if (!userId) {
            throw new AppError(401, 'Must be logged in to access shared files');
        }

        res.json({
            message: 'File access granted',
            file: share.file,
            sharedBy: share.file.owner,
            sharedAt: share.createdAt,
            expiresAt: share.expiryDate
        });
    } catch (error) {
        next(error);
    }
};
