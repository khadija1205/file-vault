export interface JWTPayload {
    id: string;
    email: string;
}

export interface FileMetadate {
    filename: string;
    fileType: string;
    fileSize: number;
    uploadData: Date;
}

export class AppError extends Error {
    constructor(public statusCode: number, public message: string) {
        super(message);
    }
}
