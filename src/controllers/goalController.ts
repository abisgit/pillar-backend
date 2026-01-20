import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/authMiddleware';

const prisma = new PrismaClient();

// @desc    Get all goals for user
// @route   GET /api/goals
// @access  Private
export const getGoals = async (req: AuthRequest, res: Response) => {
    try {
        const goals = await prisma.goal.findMany({
            where: {
                userId: req.user.id,
            },
        });
        res.status(200).json(goals);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

// @desc    Set a goal
// @route   POST /api/goals
// @access  Private
export const setGoal = async (req: AuthRequest, res: Response) => {
    if (!req.body.title || !req.body.category || !req.body.difficulty || !req.body.horizon) {
        res.status(400).json({ message: 'Please add all required fields (title, category, difficulty, horizon)' });
        return;
    }

    try {
        const goal = await prisma.goal.create({
            data: {
                title: req.body.title,
                description: req.body.description,
                category: req.body.category,
                difficulty: req.body.difficulty,
                horizon: req.body.horizon,
                userId: req.user.id,
            },
        });

        res.status(200).json(goal);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

// @desc    Update goal (completion status or details)
// @route   PUT /api/goals/:id
// @access  Private
export const updateGoal = async (req: AuthRequest, res: Response) => {
    const id = req.params.id as string;

    try {
        const goal = await prisma.goal.findUnique({
            where: { id },
        });

        if (!goal) {
            res.status(404).json({ message: 'Goal not found' });
            return;
        }

        // Check for user
        if (!req.user) {
            res.status(401).json({ message: 'User not found' });
            return;
        }

        // Make sure the logged in user matches the goal user
        if (goal.userId !== req.user.id) {
            res.status(401).json({ message: 'User not authorized' });
            return;
        }

        const updatedGoal = await prisma.goal.update({
            where: { id },
            data: req.body,
        });

        res.status(200).json(updatedGoal);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

// @desc    Delete goal
// @route   DELETE /api/goals/:id
// @access  Private
export const deleteGoal = async (req: AuthRequest, res: Response) => {
    const id = req.params.id as string;

    try {
        const goal = await prisma.goal.findUnique({
            where: { id },
        });

        if (!goal) {
            res.status(404).json({ message: 'Goal not found' });
            return;
        }

        if (!req.user) {
            res.status(401).json({ message: 'User not found' });
            return;
        }

        // Make sure the logged in user matches the goal user
        if (goal.userId !== req.user.id) {
            res.status(401).json({ message: 'User not authorized' });
            return;
        }

        await prisma.goal.delete({
            where: { id },
        });

        res.status(200).json({ id });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};
