import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/authMiddleware';

const prisma = new PrismaClient();

// @desc    Get All Posts (Feed)
// @route   GET /api/posts
// @access  Private
export const getFeed = async (req: AuthRequest, res: Response) => {
    try {
        const posts = await prisma.post.findMany({
            include: {
                author: {
                    select: { id: true, name: true, image: true }
                },
                images: true,
                likes: true,
                _count: {
                    select: { comments: true, likes: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

// @desc    Create a Post
// @route   POST /api/posts
// @access  Private
export const createPost = async (req: AuthRequest, res: Response) => {
    const { content } = req.body;

    if (!content) {
        res.status(400).json({ message: 'Content is required' });
        return;
    }

    try {
        // Handle multiple files
        const imageUrls: string[] = [];
        if (req.files && Array.isArray(req.files)) {
            req.files.forEach((file: Express.Multer.File) => {
                imageUrls.push(`/uploads/${file.filename}`);
            });
        }

        const post = await prisma.post.create({
            data: {
                content,
                authorId: req.user.id,
                images: {
                    create: imageUrls.map(url => ({ url }))
                }
            },
            include: {
                author: { select: { id: true, name: true, image: true } },
                images: true
            }
        });
        res.status(201).json(post);
    } catch (error) {
        console.error("Create Post Error:", error);
        res.status(500).json({ message: 'Server Error', error });
    }
};

// @desc    Get User's Posts
// @route   GET /api/posts/user/:id
// @access  Private
export const getUserPosts = async (req: AuthRequest, res: Response) => {
    try {
        const posts = await prisma.post.findMany({
            where: { authorId: req.params.id as string },
            include: {
                author: { select: { id: true, name: true, image: true } },
                images: true,
                likes: true,
                _count: { select: { comments: true, likes: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

// @desc    Like a Post
// @route   PUT /api/posts/:id/like
// @access  Private
export const likePost = async (req: AuthRequest, res: Response) => {
    try {
        const postId = req.params.id as string;
        const userId = req.user.id;

        const existingLike = await prisma.like.findFirst({
            where: { postId, userId }
        });

        if (existingLike) {
            await prisma.like.delete({
                where: { id: existingLike.id }
            });
            res.status(200).json({ message: 'Post unliked', liked: false });
        } else {
            await prisma.like.create({
                data: { postId, userId }
            });
            res.status(200).json({ message: 'Post liked', liked: true });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};
