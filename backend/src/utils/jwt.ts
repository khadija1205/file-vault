import jwt from 'jsonwebtoken';
import { JWTPayload } from '../types';

export const generateToken = (id: string, email: string): string => {
    return jwt.sign({ id, email }, process.env.JWT_SECRET!, { expiresIn: process.env.JWT_EXPIRE || '7d' });
};
