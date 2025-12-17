import { z } from 'zod';


export const registerSchema = z.object({
    username: z.string().min(3, "Username must be 3+ chars"),
    email: z.email("Invalid email"),
    password: z.string().min(6, "Password must be 6+ chars")
});


export const loginSchema = z.object({
    email: z.email("Invalid email"),
    password: z.string().min(1, "Password required")
});


export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;