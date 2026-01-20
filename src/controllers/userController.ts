import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/authMiddleware';

const prisma = new PrismaClient();

// @desc    Update User Profile (Avatar, Bio, etc.)
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = async (req: AuthRequest, res: Response) => {
    try {
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

        const updatedUser = await prisma.user.update({
            where: { id: req.user.id },
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

// @desc    Get Goal Completion Stats (Heatmap)
// @route   GET /api/users/stats
// @access  Private
// Putting this here for now as it relates to user profile stats
export const getUserStats = async (req: AuthRequest, res: Response) => {
    try {
        // Simple daily counts of completed goals
        const completedGoals = await prisma.goal.groupBy({
            by: ['completedAt'],
            where: {
                userId: req.user.id,
                isCompleted: true,
                completedAt: { not: null }
            },
            _count: {
                id: true
            }
        });

        // Format for frontend heatmap: { "2023-01-01": 5, ... }
        // Note: completedAt might include time, need to truncate to date.
        // Prisma groupBy with Date truncation is tricky across DBs.
        // Let's fetch raw for now and process in memory (easier for MVP).

        const rawGoals = await prisma.goal.findMany({
            where: {
                userId: req.user.id,
                isCompleted: true,
                completedAt: { not: null }
            },
            select: { completedAt: true }
        });

        const stats: Record<string, number> = {};
        rawGoals.forEach(g => {
            if (g.completedAt) {
                const date = g.completedAt.toISOString().split('T')[0];
                stats[date] = (stats[date] || 0) + 1;
            }
        });

        res.status(200).json(stats);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
}
