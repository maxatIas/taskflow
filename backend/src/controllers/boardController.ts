import { Request, Response, NextFunction } from 'express';
import Board from '../models/Board';
import Task from '../models/Task';
import User from '../models/User';
import { CustomError } from '../middlewares/errorHandler';

// @desc    Get all boards for current user
// @route   GET /api/boards
// @access  Private
export const getAllBoards = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    
    // Find boards where user is either creator or member
    const boards = await Board.find({
      $or: [
        { createdBy: userId },
        { members: userId }
      ]
    }).populate('createdBy', 'username email').populate('members', 'username email');
    
    // Get task count for each board
    const boardsWithTaskCount = await Promise.all(
      boards.map(async (board) => {
        const taskCount = await Task.countDocuments({ boardId: board._id });
        return {
          ...board.toObject(),
          taskCount
        };
      })
    );
    
    res.status(200).json({
      status: 'success',
      count: boardsWithTaskCount.length,
      data: {
        boards: boardsWithTaskCount
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single board
// @route   GET /api/boards/:id
// @access  Private
export const getBoard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const board = await Board.findById(req.params.id)
      .populate('createdBy', 'username email')
      .populate('members', 'username email');
    
    if (!board) {
      const error: CustomError = new Error('Board not found');
      error.statusCode = 404;
      return next(error);
    }
    
    // Check if user has access to this board
    const userId = req.user?.id;
    const hasAccess = board.createdBy.toString() === userId || 
                     board.members.some(member => member.toString() === userId);
    
    if (!hasAccess) {
      const error: CustomError = new Error('Not authorized to access this board');
      error.statusCode = 403;
      return next(error);
    }
    
    // Get tasks for this board
    const tasks = await Task.find({ boardId: board._id })
      .populate('createdBy', 'username email')
      .populate('assignedTo', 'username email');
    
    res.status(200).json({
      status: 'success',
      data: {
        board,
        tasks
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new board
// @route   POST /api/boards
// @access  Private
export const createBoard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description } = req.body;
    const userId = req.user?.id;
    
    // Create board
    const board = await Board.create({
      name,
      description,
      createdBy: userId
    });
    
    // Populate createdBy
    await board.populate('createdBy', 'username email');
    
    res.status(201).json({
      status: 'success',
      data: {
        board
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update board
// @route   PUT /api/boards/:id
// @access  Private
export const updateBoard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description } = req.body;
    const userId = req.user?.id;
    
    const board = await Board.findById(req.params.id);
    
    if (!board) {
      const error: CustomError = new Error('Board not found');
      error.statusCode = 404;
      return next(error);
    }
    
    // Check if user is owner
    if (board.createdBy.toString() !== userId) {
      const error: CustomError = new Error('Not authorized to update this board');
      error.statusCode = 403;
      return next(error);
    }
    
    // Update board
    if (name) board.name = name;
    if (description !== undefined) board.description = description;
    
    await board.save();
    
    // Populate and return
    await board.populate('createdBy', 'username email').populate('members', 'username email');
    
    res.status(200).json({
      status: 'success',
      data: {
        board
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete board
// @route   DELETE /api/boards/:id
// @access  Private
export const deleteBoard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    
    const board = await Board.findById(req.params.id);
    
    if (!board) {
      const error: CustomError = new Error('Board not found');
      error.statusCode = 404;
      return next(error);
    }
    
    // Check if user is owner
    if (board.createdBy.toString() !== userId) {
      const error: CustomError = new Error('Not authorized to delete this board');
      error.statusCode = 403;
      return next(error);
    }
    
    // Delete all tasks in the board
    await Task.deleteMany({ boardId: board._id });
    
    // Delete the board
    await board.deleteOne();
    
    res.status(200).json({
      status: 'success',
      message: 'Board deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Add member to board
// @route   POST /api/boards/:id/members
// @access  Private
export const addMember = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.body;
    const currentUserId = req.user?.id;
    
    const board = await Board.findById(req.params.id);
    
    if (!board) {
      const error: CustomError = new Error('Board not found');
      error.statusCode = 404;
      return next(error);
    }
    
    // Check if user is owner
    if (board.createdBy.toString() !== currentUserId) {
      const error: CustomError = new Error('Not authorized to add members to this board');
      error.statusCode = 403;
      return next(error);
    }
    
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      const error: CustomError = new Error('User not found');
      error.statusCode = 404;
      return next(error);
    }
    
    // Check if user is already a member
    if (board.members.some(member => member.toString() === userId)) {
      const error: CustomError = new Error('User is already a member of this board');
      error.statusCode = 400;
      return next(error);
    }
    
    // Add member
    board.members.push(userId);
    await board.save();
    
    // Populate and return
    await board.populate('createdBy', 'username email').populate('members', 'username email');
    
    res.status(200).json({
      status: 'success',
      data: {
        board
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Remove member from board
// @route   DELETE /api/boards/:id/members/:memberId
// @access  Private
export const removeMember = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { memberId } = req.params;
    const currentUserId = req.user?.id;
    
    const board = await Board.findById(req.params.id);
    
    if (!board) {
      const error: CustomError = new Error('Board not found');
      error.statusCode = 404;
      return next(error);
    }
    
    // Check if user is owner
    if (board.createdBy.toString() !== currentUserId) {
      const error: CustomError = new Error('Not authorized to remove members from this board');
      error.statusCode = 403;
      return next(error);
    }
    
    // Cannot remove owner
    if (memberId === board.createdBy.toString()) {
      const error: CustomError = new Error('Cannot remove board owner');
      error.statusCode = 400;
      return next(error);
    }
    
    // Remove member
    board.members = board.members.filter(
      member => member.toString() !== memberId
    );
    
    await board.save();
    
    // Populate and return
    await board.populate('createdBy', 'username email').populate('members', 'username email');
    
    res.status(200).json({
      status: 'success',
      data: {
        board
      }
    });
  } catch (err) {
    next(err);
  }
};
