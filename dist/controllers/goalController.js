"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteGoal = exports.updateGoal = exports.setGoal = exports.getGoals = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// @desc    Get all goals for user
// @route   GET /api/goals
// @access  Private
const getGoals = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const goals = yield prisma.goal.findMany({
            where: {
                userId: req.user.id,
            },
        });
        res.status(200).json(goals);
    }
    catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
});
exports.getGoals = getGoals;
// @desc    Set a goal
// @route   POST /api/goals
// @access  Private
const setGoal = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.body.title || !req.body.category || !req.body.difficulty || !req.body.horizon) {
        res.status(400).json({ message: 'Please add all required fields (title, category, difficulty, horizon)' });
        return;
    }
    try {
        const goal = yield prisma.goal.create({
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
    }
    catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
});
exports.setGoal = setGoal;
// @desc    Update goal (completion status or details)
// @route   PUT /api/goals/:id
// @access  Private
const updateGoal = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const goal = yield prisma.goal.findUnique({
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
        const updatedGoal = yield prisma.goal.update({
            where: { id },
            data: req.body,
        });
        res.status(200).json(updatedGoal);
    }
    catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
});
exports.updateGoal = updateGoal;
// @desc    Delete goal
// @route   DELETE /api/goals/:id
// @access  Private
const deleteGoal = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const goal = yield prisma.goal.findUnique({
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
        yield prisma.goal.delete({
            where: { id },
        });
        res.status(200).json({ id });
    }
    catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
});
exports.deleteGoal = deleteGoal;
