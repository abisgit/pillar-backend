import express from 'express';
import { updateProfile, getUserStats, getUserById, followUser, unfollowUser } from '../controllers/userController';
import { protect } from '../middleware/authMiddleware';
import { upload } from '../middleware/uploadMiddleware';

const router = express.Router();

router.put('/profile', protect, upload.single('avatar'), updateProfile);
router.get('/stats', protect, getUserStats);
router.get('/:id', protect, getUserById);
router.post('/:id/follow', protect, followUser);
router.delete('/:id/follow', protect, unfollowUser);

export default router;
