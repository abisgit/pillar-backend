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
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Not authorized' });
            return;
        }
        const { content } = req.body;

        if (!content) {
            res.status(400).json({ message: 'Content is required' });
            return;
        }

        const imageUrls: string[] = [];
        console.log(`[Create Post] Files received:`, req.files);
        if (req.files && Array.isArray(req.files)) {
            req.files.forEach((file: any) => {
                const url = `/uploads/${file.filename}`;
                imageUrls.push(url);
                console.log(`[Create Post] Image saved at: ${url}`);
            });
        }

        const post = await prisma.post.create({
            data: {
                content: String(content),
                authorId: req.user.id as string,
                images: {
                    create: imageUrls.map(url => ({ url }))
                }
            },
            include: {
                author: { select: { id: true, name: true, image: true } },
                images: true
            }
        });
        console.log(`[Create Post] Post created with ${imageUrls.length} images.`);
        res.status(201).json(post);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

// @desc    Get User's Posts
// @route   GET /api/posts/user/:id
// @access  Private
export const getUserPosts = async (req: AuthRequest, res: Response) => {
    try {
        const authorId = req.params.id as string;
        const posts = await prisma.post.findMany({
            where: { authorId },
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
        if (!req.user) {
            res.status(401).json({ message: 'Not authorized' });
            return;
        }
        const postId = req.params.id as string;
        const userId = req.user.id as string;

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

// @desc    Comment on a Post
// @route   POST /api/posts/:id/comment
// @access  Private
export const commentPost = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Not authorized' });
            return;
        }
        const { content } = req.body;
        const postId = req.params.id as string;
        const authorId = req.user.id as string;

        if (!content) {
            res.status(400).json({ message: 'Comment content is required' });
            return;
        }

        const comment = await prisma.comment.create({
            data: {
                content: String(content),
                postId,
                authorId
            },
            include: {
                author: { select: { id: true, name: true, image: true } }
            }
        });

        res.status(201).json(comment);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

// @desc    Get Post Comments
// @route   GET /api/posts/:id/comments
// @access  Private
export const getComments = async (req: AuthRequest, res: Response) => {
    try {
        const postId = req.params.id as string;
        const comments = await prisma.comment.findMany({
            where: { postId },
            include: {
                author: { select: { id: true, name: true, image: true } }
            },
            orderBy: { createdAt: 'asc' }
        });
        res.status(200).json(comments);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};
