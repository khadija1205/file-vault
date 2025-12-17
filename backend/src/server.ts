import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { prisma } from './config/prisma';
import { errorHandler } from './middlewares/errorHandler';

import authRoutes from './routes/auth';
import fileRoutes from './routes/files';
import sharingRoutes from './routes/sharing';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
    cors({
        origin: process.env.FRONTEND_URL,
        credentials: true
    })
);
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/shares', sharingRoutes);

app.use(errorHandler);

const start = async () => {
    try {
        await prisma.$connect();
        console.log('Database connected');

        app.listen(PORT, () => {
            console.log(`Backend running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Startup error:', error);
        process.exit(1);
    }
};

start();

process.on('SIGINT', async () => {
    await prisma.$disconnect();
    process.exit(0);
});
