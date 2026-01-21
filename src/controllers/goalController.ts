import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/authMiddleware';

const prisma = new PrismaClient();

// @desc    Get All User Goals
// @route   GET /api/goals
// @access  Private
export const getGoals = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Not authorized' });
            return;
        }
        const goals = await prisma.goal.findMany({
            where: { userId: req.user.id as string },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json(goals);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

// @desc    Create/Set Goal
// @route   POST /api/goals
// @access  Private
export const setGoal = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Not authorized' });
            return;
        }
        const { title, category, horizon, description } = req.body;

        if (!title || !category || !horizon) {
            res.status(400).json({ message: 'Title, Category, and Horizon are required' });
            return;
        }

        const goal = await prisma.goal.create({
            data: {
                title: String(title),
                category: String(category),
                horizon: String(horizon),
                description: String(description || ''),
                userId: req.user.id as string
            }
        });
        res.status(201).json(goal);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

// @desc    Update Goal (Toggle Completion or Edit)
// @route   PUT /api/goals/:id
// @access  Private
export const updateGoal = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Not authorized' });
            return;
        }
        const { isCompleted, title, description } = req.body;
        const id = req.params.id as string;

        const goal = await prisma.goal.findUnique({ where: { id } });

        if (!goal || goal.userId !== req.user.id) {
            res.status(404).json({ message: 'Goal not found' });
            return;
        }

        const updateData: any = {};
        if (typeof isCompleted === 'boolean') {
            updateData.isCompleted = isCompleted;
            updateData.completedAt = isCompleted ? new Date() : null;
        }
        if (title) updateData.title = String(title);
        if (description) updateData.description = String(description);

        const updatedGoal = await prisma.goal.update({
            where: { id },
            data: updateData
        });

        res.status(200).json(updatedGoal);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

// @desc    Delete Goal
// @route   DELETE /api/goals/:id
// @access  Private
export const deleteGoal = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Not authorized' });
            return;
        }
        const id = req.params.id as string;
        const goal = await prisma.goal.findUnique({ where: { id } });

        if (!goal || goal.userId !== req.user.id) {
            res.status(404).json({ message: 'Goal not found' });
            return;
        }

        await prisma.goal.delete({ where: { id } });
        res.status(200).json({ id });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

// @desc    Get Goal Templates
// @route   GET /api/goals/templates
// @access  Private
export const getGoalTemplates = async (req: AuthRequest, res: Response) => {
    try {
        const category = req.query.category as string;
        const templates = await prisma.goalTemplate.findMany({
            where: category ? { category: String(category) } : {}
        });
        res.status(200).json(templates);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};
