import { Request, Response, NextFunction } from 'express';
import { AppError } from '../types';
import { ZodError } from 'zod';
import { S3Client, HeadBucketCommand } from '@aws-sdk/client-s3';

export const errorHandler = (error: Error | AppError | ZodError, req: Request, res: Response, next: NextFunction) => {
    console.error(error);

    if (error instanceof ZodError) {
        return res.status(400).json({
            message: 'Validation Error',
            errors: error.issues
        });
    }

    if (error instanceof AppError) {
        return res.status(error.statusCode).json({
            message: error.message
        });
    }

    res.status(500).json({
        message: error instanceof Error ? error.message : 'Internal Server Error'
    });
};

export const validateS3Connection = async (s3Client: S3Client) => {
    try {
        const command = new HeadBucketCommand({
            Bucket: process.env.AWS_S3_BUCKET_NAME!
        });
        await s3Client.send(command);
        console.log('AWS S3 bucket connected successfully');
    } catch (error) {
        console.error('AWS S3 connection failed:', error);
        throw error;
    }
};
