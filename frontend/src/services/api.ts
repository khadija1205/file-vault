import axios, { AxiosError } from 'axios';

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL
});

// Add token to requests
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

// Auth API
export const authAPI = {
    register: (username: string, email: string, password: string) =>
        API.post('/auth/register', { username, email, password }),
    login: (email: string, password: string) => API.post('/auth/login', { email, password })
};

// File API
export const fileAPI = {
    uploadFile: (formData: FormData) =>
        API.post('/files/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }),

    getUserFiles: () => API.get('/files'),
    deleteFile: (fileId: string) => API.delete(`/files/${fileId}`),
    downloadFile: (fileId: string) => API.get(`/files/download/${fileId}`)
};

// Sharing API
export const sharingAPI = {
    shareWithUser: (fileId: string, userId: string) => API.post('/shares/share-user', { fileId, userId }),
    generateLink: (fileId: string, expiryHours?: number) => API.post('/shares/generate-link', { fileId, expiryHours }),
    accessSharedFile: (shareLink: string) => API.get(`/shares/link/${shareLink}`),
    revokeShare: (shareId: string) => API.delete(`/shares/${shareId}`)
};

export default API;
