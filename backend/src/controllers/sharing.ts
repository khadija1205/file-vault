import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { prisma } from '../config/prisma';
import { AppError } from '../types';
import { ShareFileInput, GenerateLinkInput } from '../schemas/file';

export const shareWithUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { fileId, userId } = req.body as ShareFileInput;

        const file = await prisma.file.findUnique({ where: { id: fileId } });

        if (!file || file.ownerId !== req.userId) {
            throw new AppError(403, 'Not authorized');
        }

        const share = await prisma.share.create({
            data: {
                fileId,
                sharedById: req.userId!,
                sharedWithId: userId
            }
        });

        res.status(201).json({
            message: 'File shared',
            share
        });
    } catch (error) {
        next(error);
    }
};

export const generateShareLink = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { fileId, expiryHours } = req.body as GenerateLinkInput;

        const file = await prisma.file.findUnique({ where: { id: fileId } });

        if (!file || file.ownerId !== req.userId) {
            throw new AppError(403, 'Not authorized');
        }

        const shareLink = crypto.randomBytes(16).toString('hex');
        const expiryDate = expiryHours ? new Date(Date.now() + expiryHours * 3600000) : null;

        const share = await prisma.share.create({
            data: {
                fileId,
                sharedById: req.userId!,
                shareLink,
                expiryDate
            }
        });

        res.status(201).json({
            message: 'Share link generated',
            shareLink: `${process.env.FRONTEND_URL}/shared/${shareLink}`,
            share
        });
    } catch (error) {
        next(error);
    }
};

export const accessSharedFile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { shareLink } = req.params;

        const share = await prisma.share.findUnique({
            where: { shareLink },
            include: { file: true }
        });

        if (!share || !share.file || (share.expiryDate && new Date(share.expiryDate) < new Date())) {
            throw new AppError(403, 'Invalid or expired link');
        }

        res.json({ file: share.file });
    } catch (error) {
        next(error);
    }
};

export const revokeShare = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { shareId } = req.params;

        const share = await prisma.share.findUnique({ where: { id: shareId } });

        if (!share || share.sharedById !== req.userId) {
            throw new AppError(403, 'Not authorized');
        }

        await prisma.share.delete({ where: { id: shareId } });

        res.json({ message: 'Share revoked' });
    } catch (error) {
        next(error);
    }
};
