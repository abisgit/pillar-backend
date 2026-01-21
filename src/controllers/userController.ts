import { Response, Request } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/authMiddleware';

const prisma = new PrismaClient();

// @desc    Update User Profile (Avatar, Bio, etc.)
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Not authorized' });
            return;
        }

        const { name, bio } = req.body;
        let avatarUrl = undefined;

        console.log(`[Update Profile] User: ${req.user.id}, Body:`, req.body);
        if (req.file) {
            avatarUrl = `/uploads/${req.file.filename}`;
            console.log(`[Update Profile] New avatar uploaded: ${avatarUrl}`);
        }

        const updateData: any = {
            name: name || undefined,
            bio: bio || undefined,
        };

        if (avatarUrl) {
            updateData.image = avatarUrl;
        }

        console.log(`[Update Profile] updateData:`, updateData);

        const updatedUser = await prisma.user.update({
            where: { id: req.user.id as string },
            data: updateData,
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
                bio: true
            }
        });

        console.log(`[Update Profile] Success:`, updatedUser);
        res.status(200).json(updatedUser);

    } catch (error) {
        console.error(`[Update Profile] Error:`, error);
        res.status(500).json({ message: 'Server Error', error });
    }
};

// @desc    Get User By ID
// @route   GET /api/users/:id
// @access  Private
export const getUserById = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Not authorized' });
            return;
        }

        const id = req.params.id as string;
        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                image: true,
                bio: true,
                _count: {
                    select: {
                        followers: true,
                        following: true,
                        posts: true
                    }
                },
                followers: {
                    where: { followerId: req.user.id as string }
                }
            }
        });

        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        // Add isFollowing flag
        const isFollowing = user.followers.length > 0;
        const { followers, ...userData } = user;

        res.status(200).json({ ...userData, isFollowing });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

// @desc    Follow User
// @route   POST /api/users/:id/follow
// @access  Private
export const followUser = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Not authorized' });
            return;
        }

        const targetId = req.params.id as string;
        const followerId = req.user.id as string;

        if (targetId === followerId) {
            res.status(400).json({ message: 'You cannot follow yourself' });
            return;
        }

        await prisma.follows.upsert({
            where: {
                followerId_followingId: {
                    followerId,
                    followingId: targetId
                }
            },
            update: {},
            create: {
                followerId,
                followingId: targetId
            }
        });

        res.status(200).json({ message: 'User followed' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

// @desc    Unfollow User
// @route   DELETE /api/users/:id/follow
// @access  Private
export const unfollowUser = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Not authorized' });
            return;
        }

        const followingId = req.params.id as string;
        const followerId = req.user.id as string;

        await prisma.follows.delete({
            where: {
                followerId_followingId: {
                    followerId,
                    followingId
                }
            }
        });

        res.status(200).json({ message: 'User unfollowed' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

// @desc    Get User Stats for Heatmap
// @route   GET /api/users/:id/stats
// @access  Private
export const getUserStats = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.params.id as string;

        // Fetch completed goals with their completion dates
        const completedGoals = await prisma.goal.findMany({
            where: {
                userId,
                isCompleted: true,
                completedAt: { not: null }
            },
            select: { completedAt: true }
        });

        // Group by date and count
        const stats: Record<string, number> = {};
        completedGoals.forEach(goal => {
            if (goal.completedAt) {
                const date = goal.completedAt.toISOString().split('T')[0];
                stats[date] = (stats[date] || 0) + 1;
            }
        });

        const formattedStats = Object.entries(stats).map(([date, count]) => ({
            date,
            count
        }));

        res.status(200).json(formattedStats);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};
