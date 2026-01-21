import express from 'express';
import { getFeed, createPost, getUserPosts, likePost, commentPost, getComments } from '../controllers/postController';
import { protect } from '../middleware/authMiddleware';

import { upload } from '../middleware/uploadMiddleware';

const router = express.Router();

router.route('/')
    .get(protect, getFeed)
    .post(protect, upload.array('images', 10), createPost);

router.route('/user/:id').get(protect, getUserPosts);
router.route('/:id/like').put(protect, likePost);
router.route('/:id/comment').post(protect, commentPost);
router.route('/:id/comments').get(protect, getComments);

export default router;
