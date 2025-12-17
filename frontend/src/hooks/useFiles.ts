import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fileAPI, sharingAPI } from '../services/api';
import type { File } from '../types';
import { authAPI } from '../services/api';

export const useGetFiles = () => {
    return useQuery({
        queryKey: ['files'],
        queryFn: async () => {
            const response = await fileAPI.getUserFiles();
            return response.data as File[];
        }
    });
};

export const useUploadFile = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (formData: FormData) => fileAPI.uploadFile(formData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['files'] });
        }
    });
};

export const useShareFileWithUsers = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ fileId, userIds, expiryDays }: { fileId: string; userIds: string[]; expiryDays?: number }) =>
            sharingAPI.shareWithUsers(fileId, userIds, expiryDays),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['files'] });
        }
    });
};

export const useSearchUser = (email: string) => {
    return useQuery({
        queryKey: ['user', email],
        queryFn: () => authAPI.searchUserByEmail(email),
        enabled: email.length > 0 && email.includes('@'),
        staleTime: 1000 * 60 * 5 // 5 minutes
    });
};

export const useGetSharedWithMe = () => {
    return useQuery({
        queryKey: ['sharedWithMe'],
        queryFn: async () => {
            const response = await sharingAPI.getSharedWithMe();
            return response.data.files;
        }
    });
};

export const useAccessSharedFile = (shareLink: string) => {
    return useQuery({
        queryKey: ['sharedFile', shareLink],
        queryFn: () => sharingAPI.accessSharedFile(shareLink),
        enabled: shareLink.length > 0,
        retry: false
    });
};

export const useDeleteFiles = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (fileId: string) => fileAPI.deleteFile(fileId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['files'] });
        }
    });
};
