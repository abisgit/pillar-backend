import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

const generateToken = (id: string) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'stoic_secret_key_123', {
        expiresIn: '30d',
    });
};

export const registerUser = async (req: Request, res: Response): Promise<void> => {
    const { name, email, password } = req.body;

    try {
        const userExists = await prisma.user.findUnique({
            where: { email },
        });

        if (userExists) {
            res.status(400).json({ message: 'User already exists' });
            return; // Ensure we return void
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            },
        });

        res.status(201).json({
            id: user.id,
            name: user.name,
            email: user.email,
            token: generateToken(user.id),
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: (error as Error).message });
    }
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;
    console.log(`[Login Attempt] Email: ${email}`);

    try {
        const user = await prisma.user.findUnique({
            where: { email },
        });

        console.log(`[Login] User found: ${!!user}`);

        if (user && (await bcrypt.compare(password, user.password))) {
            console.log(`[Login] Password verified for ${email}`);
            res.json({
                id: user.id,
                name: user.name,
                email: user.email,
                image: user.image,
                bio: user.bio,
                token: generateToken(user.id),
            });
            return;
        } else {
            console.log(`[Login] Failed: Invalid credentials for ${email}`);
            res.status(401).json({ message: 'Invalid email or password' });
            return;
        }
    } catch (error) {
        console.error(`[Login Error]:`, error);
        res.status(500).json({ message: 'Server error', error: (error as Error).message });
    }
};

export const getMe = async (req: Request, res: Response) => {
    // In a real app, you'd fetch the user from DB based on req.user.id (from middleware)
    // For now, just return what's expected or basic info
    res.status(200).json({ message: 'User data' });
};
