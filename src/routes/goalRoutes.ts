import express from 'express';
import {
    getGoals,
    setGoal,
    updateGoal,
    deleteGoal,
    getGoalTemplates
} from '../controllers/goalController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/templates', protect, getGoalTemplates);
router.route('/').get(protect, getGoals).post(protect, setGoal);
router.route('/:id').put(protect, updateGoal).delete(protect, deleteGoal);

export default router;
