import { Router } from 'express';
import { protect } from '../middlewares/auth';
import { getAllUsers, getUserById } from '../controllers/userController';

const router = Router();

// All routes are protected
router.use(protect);

// Get all users (for member search)
router.get('/', getAllUsers);

// Get user by ID
router.get('/:id', getUserById);

export default router;
