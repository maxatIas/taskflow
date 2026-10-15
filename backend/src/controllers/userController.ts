import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import { CustomError } from '../middlewares/errorHandler';

// @desc    Get all users (for member search/autocomplete)
// @route   GET /api/users
// @access  Private
export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get current user ID to exclude from results
    const currentUserId = req.user?.id;
    
    // Find all users except current user
    const users = await User.find({ _id: { $ne: currentUserId } })
      .select('-password')
      .limit(50); // Limit results for performance
    
    res.status(200).json({
      status: 'success',
      count: users.length,
      data: {
        users
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      const error: CustomError = new Error('User not found');
      error.statusCode = 404;
      return next(error);
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        user
      }
    });
  } catch (err) {
    next(err);
  }
};
