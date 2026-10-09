import { Router } from 'express';
import {
  getAllBoards,
  getBoard,
  createBoard,
  updateBoard,
  deleteBoard,
  addMember,
  removeMember
} from '../controllers/boardController';
import { protect } from '../middlewares/auth';

const router = Router();

// All routes are protected
router.use(protect);

// Board routes
router.get('/', getAllBoards);
router.get('/:id', getBoard);
router.post('/', createBoard);
router.put('/:id', updateBoard);
router.delete('/:id', deleteBoard);

// Member routes
router.post('/:id/members', addMember);
router.delete('/:id/members/:memberId', removeMember);

export default router;
