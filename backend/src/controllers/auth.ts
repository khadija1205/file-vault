import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/prisma';
import { generateToken } from '../utils/jwt';
import { AppError } from '../types';
import { RegisterInput, LoginInput } from '../schemas/auth';

export const register = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { username, email, password } = req.body as RegisterInput;

        const existingUser = await prisma.user.findFirst({
            where: { OR: [{ email }, { username }] }
        });

        if (existingUser) {
            throw new AppError(400, 'User already exists');
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: { username, email, password: hashedPassword }
        });

        const token = generateToken(user.id, user.email);

        res.status(201).json({
            message: 'User created',
            token,
            userId: user.id
        });
    } catch (error) {
        next(error);
    }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body as LoginInput;

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            throw new AppError(401, 'Invalid credentials');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            throw new AppError(401, 'Invalid credentials');
        }

        const token = generateToken(user.id, user.email);

        res.json({
            message: 'Login successfull',
            token,
            userId: user.id
        });
    } catch (error) {
        next(error);
    }
};
