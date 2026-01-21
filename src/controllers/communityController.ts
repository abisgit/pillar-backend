import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/authMiddleware';

const prisma = new PrismaClient();

// @desc    Get All Communities
// @route   GET /api/communities
// @access  Private
export const getCommunities = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Not authorized' });
            return;
        }

        const type = req.query.type as string;

        const myMemberships = await prisma.member.findMany({
            where: { userId: req.user.id as string },
            select: { communityId: true }
        });
        const myCommunityIds = myMemberships.map(m => m.communityId);

        let whereClause: any = {};
        if (type === 'my') {
            whereClause = { id: { in: myCommunityIds } };
        } else if (type === 'suggested') {
            whereClause = { id: { notIn: myCommunityIds } };
        }

        const communities = await prisma.community.findMany({
            where: whereClause,
            include: {
                _count: {
                    select: {
                        members: true,
                        posts: true,
                        events: true
                    }
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
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Not authorized' });
            return;
        }
        const { name, description, city } = req.body;

        if (!name) {
            res.status(400).json({ message: 'Community name is required' });
            return;
        }

        const community = await prisma.community.create({
            data: {
                name: String(name),
                description: description ? String(description) : null,
                city: city ? String(city) : null,
                creatorId: req.user.id as string,
                members: {
                    create: {
                        userId: req.user.id as string,
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

// @desc    Join Community
// @route   POST /api/communities/:id/join
// @access  Private
export const joinCommunity = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Not authorized' });
            return;
        }
        const communityId = req.params.id as string;
        const userId = req.user.id as string;

        const member = await prisma.member.create({
            data: {
                userId,
                communityId,
                role: 'MEMBER'
            }
        });

        res.status(201).json(member);
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
            orderBy: { date: 'asc' },
            include: {
                community: { select: { name: true } },
                _count: { select: { attendees: true } }
            }
        });
        res.status(200).json(events);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
}

// @desc    Create Event
// @route   POST /api/events
// @access  Private
export const createEvent = async (req: AuthRequest, res: Response) => {
    try {
        const { title, description, date, location, communityId } = req.body;
        const event = await prisma.event.create({
            data: {
                title: String(title),
                description: description ? String(description) : null,
                date: new Date(String(date)),
                location: location ? String(location) : null,
                communityId: communityId ? String(communityId) : null
            }
        });
        res.status(201).json(event);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
}

// @desc    Join Event
// @route   POST /api/events/:id/join
// @access  Private
export const joinEvent = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Not authorized' });
            return;
        }
        const eventId = req.params.id as string;
        const userId = req.user.id as string;
        await prisma.eventAttendee.upsert({
            where: { userId_eventId: { userId, eventId } },
            update: {},
            create: { userId, eventId }
        });
        res.status(200).json({ message: 'Joined event' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
}
