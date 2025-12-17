import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { AppError } from '../types';
import { uploadToS3, deleteFromS3 } from '../utils/s3';

export const uploadFile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.file) {
            throw new AppError(400, 'No file provided');
        }

        // Validate file size (100MB limit)
        const MAX_FILE_SIZE = 100 * 1024 * 1024;
        if (req.file.size > MAX_FILE_SIZE) {
            throw new AppError(400, 'File size exceeds 100MB limit');
        }

        const userId = req.userId!;

        // Upload to S3 using utility function
        const { key, url } = await uploadToS3(req.file, userId);

        // Save to database
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

        // Delete from S3 using utility function
        await deleteFromS3(file.s3Key);

        // Delete from database
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

        res.json({
            downloadUrl: file.filebaseUrl,
            filename: file.filename
        });
    } catch (error) {
        next(error);
    }
};
