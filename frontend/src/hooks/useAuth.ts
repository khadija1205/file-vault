import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { authAPI } from '../services/api';
import type { RegisterInput, LoginInput } from "../schemas/auth";



export const useRegister = () => {

    const navigate = useNavigate();
    
    return useMutation({
        mutationFn: (data: RegisterInput) =>
            authAPI.register(data.username, data.email, data.password),
        onSuccess: (response) => {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('userId', response.data.userId);
            navigate('/dashboard');
        }
    });
};


export const useLogin = () => {

    const navigate = useNavigate();


    return useMutation({
        mutationFn: (data: LoginInput) =>
            authAPI.login(data.email, data.password),
        onSuccess: (response) => {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('userId', response.data.userId);
            navigate('/dashboard');
        }
    });
};