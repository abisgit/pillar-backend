import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 4000;

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use(cors()); // Allow all origins for MVP dev to fix blocking issues
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Pillar API is running');
});

import authRoutes from './routes/authRoutes';
import goalRoutes from './routes/goalRoutes';
import postRoutes from './routes/postRoutes';
import communityRoutes, { eventRouter } from './routes/communityRoutes';
import userRoutes from './routes/userRoutes';

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/communities', communityRoutes);
app.use('/api/events', eventRouter);
app.use('/api/users', userRoutes);

// Health check and DB check
app.get('/health', async (req, res) => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        res.json({ status: 'ok', db: 'connected' });
    } catch (error) {
        res.status(500).json({ status: 'error', db: 'disconnected', error });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
