import { Router } from 'express';
import { register, login, logout, getMe } from '../controllers/authController';
import { protect } from '../middlewares/auth';

const router = Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);

export default router;
