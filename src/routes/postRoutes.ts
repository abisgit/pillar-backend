import express from 'express';
import { getFeed, createPost, getUserPosts, likePost } from '../controllers/postController';
import { protect } from '../middleware/authMiddleware';

import { upload } from '../middleware/uploadMiddleware';

const router = express.Router();

router.route('/')
    .get(protect, getFeed)
    .post(protect, upload.array('images', 10), createPost);

router.route('/user/:id').get(protect, getUserPosts);
router.route('/:id/like').put(protect, likePost);

export default router;
