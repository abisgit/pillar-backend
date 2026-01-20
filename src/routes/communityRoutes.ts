import express from 'express';
import { getCommunities, createCommunity, getEvents } from '../controllers/communityController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/')
    .get(protect, getCommunities)
    .post(protect, createCommunity);

// We'll expose events under /api/communities/events or a separate route. 
// For simplicity, let's keep event route separate if possible, but cleaner here for grouping.
// Actually, let's make a separate route block for events in index.ts or just export another router. 
// For now, I'll export a separate router for events to keep it clean in index.ts

export default router;

export const eventRouter = express.Router();
eventRouter.route('/')
    .get(protect, getEvents);
