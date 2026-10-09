import { Router } from 'express';
import {
  getTasksByBoard,
  createTask,
  getTask,
  updateTask,
  deleteTask,
  updateTaskStatus
} from '../controllers/taskController';
import { protect } from '../middlewares/auth';

const router = Router();

// All routes are protected
router.use(protect);

// Task routes
router.get('/board/:boardId', getTasksByBoard);
router.post('/board/:boardId', createTask);
router.get('/:id', getTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);
router.patch('/:id/status', updateTaskStatus);

export default router;
