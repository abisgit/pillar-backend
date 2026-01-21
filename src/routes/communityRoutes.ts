import express from 'express';
import {
    getCommunities,
    createCommunity,
    joinCommunity,
    getEvents,
    createEvent,
    joinEvent
} from '../controllers/communityController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/')
    .get(protect, getCommunities)
    .post(protect, createCommunity);

router.post('/:id/join', protect, joinCommunity);

export default router;

export const eventRouter = express.Router();
eventRouter.route('/')
    .get(protect, getEvents)
    .post(protect, createEvent);

eventRouter.post('/:id/join', protect, joinEvent);
