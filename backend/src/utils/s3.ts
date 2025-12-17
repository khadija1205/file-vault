import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client, S3_BUCKET } from '../config/s3';
import crypto from 'crypto';

/**
 * Generate S3 key with hierarchy: userId/year/month/uniqueId-filename
 */
export const generateS3Key = (userId: string, filename: string): string => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const uniqueId = crypto.randomBytes(8).toString('hex');
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');

    return `${userId}/${year}/${month}/${uniqueId}-${sanitizedFilename}`;
};

/**
 * Upload file to S3
 */
export const uploadToS3 = async (file: Express.Multer.File, userId: string): Promise<{ key: string; url: string }> => {
    const key = generateS3Key(userId, file.originalname);

    const command = new PutObjectCommand({
        Bucket: S3_BUCKET,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        Metadata: {
            originalName: file.originalname,
            uploadedBy: userId,
            uploadDate: new Date().toISOString()
        }
    });

    await s3Client.send(command);

    return {
        key,
        url: `https://${S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`
    };
};

/**
 * Generate a presigned URL for downloading
 */
export const getPresignedDownloadUrl = async (key: string, expiresIn: number = 3600): Promise<string> => {
    const command = new GetObjectCommand({
        Bucket: S3_BUCKET,
        Key: key
    });

    return await getSignedUrl(s3Client, command, { expiresIn });
};

/**
 * Delete file from S3
 */
export const deleteFromS3 = async (key: string): Promise<void> => {
    const command = new DeleteObjectCommand({
        Bucket: S3_BUCKET,
        Key: key
    });

    await s3Client.send(command);
};
