import express from 'express';
import { updateProfile, getUserStats } from '../controllers/userController';
import { protect } from '../middleware/authMiddleware';
import { upload } from '../middleware/uploadMiddleware';

const router = express.Router();

router.put('/profile', protect, upload.single('avatar'), updateProfile);
router.get('/stats', protect, getUserStats);

export default router;
