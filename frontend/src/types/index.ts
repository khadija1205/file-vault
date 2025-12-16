export interface User {
    id: string;
    username: string;
    email: string;
}

export interface File {
    id: string;
    filename: string;
    fileType: string;
    fileSize: number;
    firebaseUrl: string;
    ownerId: string;
    createdAt: string;
}

export interface Share {
    id: string;
    fileId: string;
    sharedWithId?: string;
    shareLink?: string;
    expiryDate?: string;
}
