import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { AppError } from '../types';

export const checkFileAccess = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const fileId = req.params.fileId;
        const userId = req.userId;

        const file = await prisma.file.findUnique({
            where: { id: fileId },
            include: { shares: true }
        });

        if (!file) {
            throw new AppError(404, 'File not found');
        }

        
        if (file.ownerId === userId) {
            return next();
        }

        // Check if file is shared with user and not expired
        const validShare = file.shares.find((s: any) => {
            const isExpired = s.expiryDate && new Date(s.expiryDate) < new Date();
            return s.sharedWithId === userId && !isExpired;
        });

        if (!validShare) {
            throw new AppError(403, 'Access denied');
        }

        next();
    } catch (error) {
        next(error);
    }
};
