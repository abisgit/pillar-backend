import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/authMiddleware';

const prisma = new PrismaClient();

// @desc    Get All Communities
// @route   GET /api/communities
// @access  Private
export const getCommunities = async (req: AuthRequest, res: Response) => {
    try {
        const communities = await prisma.community.findMany({
            include: {
                _count: {
                    select: { members: true }
                }
            }
        });
        res.status(200).json(communities);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

// @desc    Create Community
// @route   POST /api/communities
// @access  Private
export const createCommunity = async (req: AuthRequest, res: Response) => {
    const { name, description, city } = req.body;

    if (!name) {
        res.status(400).json({ message: 'Community name is required' });
        return;
    }

    try {
        const community = await prisma.community.create({
            data: {
                name,
                description,
                city,
                members: {
                    create: {
                        userId: req.user.id,
                        role: 'ADMIN'
                    }
                }
            },
        });
        res.status(201).json(community);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

// @desc    Get Upcoming Events
// @route   GET /api/events
// @access  Private
export const getEvents = async (req: AuthRequest, res: Response) => {
    try {
        const events = await prisma.event.findMany({
            where: {
                date: {
                    gte: new Date()
                }
            },
            orderBy: {
                date: 'asc'
            },
            include: {
                community: {
                    select: { name: true }
                },
                _count: {
                    select: { attendees: true }
                }
            },
            take: 5
        });
        res.status(200).json(events);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
}
