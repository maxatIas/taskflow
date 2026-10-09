import { Request, Response, NextFunction } from 'express';
import Task from '../models/Task';
import Board from '../models/Board';
import { CustomError } from '../middlewares/errorHandler';
import { TaskStatus } from '../models/Task';

// @desc    Get all tasks for a board
// @route   GET /api/boards/:boardId/tasks
// @access  Private
export const getTasksByBoard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { boardId } = req.params;
    const userId = req.user?.id;
    
    // Check if board exists and user has access
    const board = await Board.findById(boardId);
    if (!board) {
      const error: CustomError = new Error('Board not found');
      error.statusCode = 404;
      return next(error);
    }
    
    const hasAccess = board.createdBy.toString() === userId || 
                     board.members.some(member => member.toString() === userId);
    
    if (!hasAccess) {
      const error: CustomError = new Error('Not authorized to access this board');
      error.statusCode = 403;
      return next(error);
    }
    
    // Get tasks
    const tasks = await Task.find({ boardId })
      .populate('createdBy', 'username email')
      .populate('assignedTo', 'username email')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      status: 'success',
      count: tasks.length,
      data: {
        tasks
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a new task
// @route   POST /api/boards/:boardId/tasks
// @access  Private
export const createTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { boardId } = req.params;
    const userId = req.user?.id;
    const { title, description, tags, assignedTo, dueDate, priority } = req.body;
    
    // Check if board exists and user has access
    const board = await Board.findById(boardId);
    if (!board) {
      const error: CustomError = new Error('Board not found');
      error.statusCode = 404;
      return next(error);
    }
    
    const hasAccess = board.createdBy.toString() === userId || 
                     board.members.some(member => member.toString() === userId);
    
    if (!hasAccess) {
      const error: CustomError = new Error('Not authorized to add tasks to this board');
      error.statusCode = 403;
      return next(error);
    }
    
    // Create task
    const task = await Task.create({
      title,
      description,
      tags: tags || [],
      boardId,
      createdBy: userId,
      assignedTo: assignedTo || [],
      dueDate,
      priority: priority || 'medium'
    });
    
    // Populate
    await task.populate('createdBy', 'username email').populate('assignedTo', 'username email');
    
    res.status(201).json({
      status: 'success',
      data: {
        task
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
export const getTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('createdBy', 'username email')
      .populate('assignedTo', 'username email')
      .populate('boardId', 'name');
    
    if (!task) {
      const error: CustomError = new Error('Task not found');
      error.statusCode = 404;
      return next(error);
    }
    
    // Check if user has access to the board
    const userId = req.user?.id;
    const board = await Board.findById(task.boardId);
    
    if (!board) {
      const error: CustomError = new Error('Board not found');
      error.statusCode = 404;
      return next(error);
    }
    
    const hasAccess = board.createdBy.toString() === userId || 
                     board.members.some(member => member.toString() === userId);
    
    if (!hasAccess) {
      const error: CustomError = new Error('Not authorized to access this task');
      error.statusCode = 403;
      return next(error);
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        task
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
export const updateTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const updates = req.body;
    
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      const error: CustomError = new Error('Task not found');
      error.statusCode = 404;
      return next(error);
    }
    
    // Check if user has access to the board
    const board = await Board.findById(task.boardId);
    if (!board) {
      const error: CustomError = new Error('Board not found');
      error.statusCode = 404;
      return next(error);
    }
    
    const hasAccess = board.createdBy.toString() === userId || 
                     board.members.some(member => member.toString() === userId);
    
    if (!hasAccess) {
      const error: CustomError = new Error('Not authorized to update this task');
      error.statusCode = 403;
      return next(error);
    }
    
    // Update task
    if (updates.title) task.title = updates.title;
    if (updates.description !== undefined) task.description = updates.description;
    if (updates.status) task.status = updates.status as TaskStatus;
    if (updates.tags) task.tags = updates.tags;
    if (updates.assignedTo) task.assignedTo = updates.assignedTo;
    if (updates.dueDate) task.dueDate = updates.dueDate;
    if (updates.priority) task.priority = updates.priority;
    
    await task.save();
    
    // Populate and return
    await task.populate('createdBy', 'username email').populate('assignedTo', 'username email');
    
    res.status(200).json({
      status: 'success',
      data: {
        task
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
export const deleteTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      const error: CustomError = new Error('Task not found');
      error.statusCode = 404;
      return next(error);
    }
    
    // Check if user has access to the board
    const board = await Board.findById(task.boardId);
    if (!board) {
      const error: CustomError = new Error('Board not found');
      error.statusCode = 404;
      return next(error);
    }
    
    const hasAccess = board.createdBy.toString() === userId || 
                     board.members.some(member => member.toString() === userId);
    
    if (!hasAccess) {
      const error: CustomError = new Error('Not authorized to delete this task');
      error.statusCode = 403;
      return next(error);
    }
    
    // Delete task
    await task.deleteOne();
    
    res.status(200).json({
      status: 'success',
      message: 'Task deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update task status (for drag and drop)
// @route   PATCH /api/tasks/:id/status
// @access  Private
export const updateTaskStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body;
    const userId = req.user?.id;
    
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      const error: CustomError = new Error('Task not found');
      error.statusCode = 404;
      return next(error);
    }
    
    // Check if user has access to the board
    const board = await Board.findById(task.boardId);
    if (!board) {
      const error: CustomError = new Error('Board not found');
      error.statusCode = 404;
      return next(error);
    }
    
    const hasAccess = board.createdBy.toString() === userId || 
                     board.members.some(member => member.toString() === userId);
    
    if (!hasAccess) {
      const error: CustomError = new Error('Not authorized to update this task');
      error.statusCode = 403;
      return next(error);
    }
    
    // Validate status
    const validStatuses: TaskStatus[] = ['todo', 'in-progress', 'done'];
    if (!validStatuses.includes(status as TaskStatus)) {
      const error: CustomError = new Error('Invalid status');
      error.statusCode = 400;
      return next(error);
    }
    
    // Update status
    task.status = status as TaskStatus;
    await task.save();
    
    // Populate and return
    await task.populate('createdBy', 'username email').populate('assignedTo', 'username email');
    
    res.status(200).json({
      status: 'success',
      data: {
        task
      }
    });
  } catch (err) {
    next(err);
  }
};
