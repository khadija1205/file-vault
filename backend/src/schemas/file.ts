import { z } from 'zod';


export const uploadFileSchema = z.object({
    filename: z.string(),
    fileType: z.string(),
    fileSize: z.number().max(100 * 1024 * 1024,'Max 100MB')
});



// export const shareFileSchema = z.object({
//     fileId: z.string(),
//     userId: z.string().optional()
// });

export const shareFileSchema = z.object({
    fileId: z.string().min(1, 'File ID required'),
    userIds: z.array(z.string().min(1)).min(1, 'At least one user required'),
    expiryDays: z.number().optional().default(0)
});


export const generateLinkSchema = z.object({
    fileId: z.string(),
    expiryHours: z.number().optional()
});


export type UploadFileInput = z.infer<typeof uploadFileSchema>;
export type ShareFileInput = z.infer<typeof shareFileSchema>;
export type GenerateLinkInput = z.infer<typeof generateLinkSchema>;