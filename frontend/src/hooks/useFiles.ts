import { useQuery, useMutation, useQueryClient, QueryClient } from "@tanstack/react-query";
import { fileAPI } from "../services/api";
import type { File } from '../types';


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


export const useDeleteFiles = () => {

    const queryClient = useQueryClient();


    return useMutation({
        mutationFn: (fileId: string) => fileAPI.deleteFile(fileId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['files'] });
        }
    });
}



