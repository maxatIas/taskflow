import { Request, Response, NextFunction } from 'express';
import User, { IUser } from '../models/User';
import { generateToken } from '../middlewares/auth';
import { CustomError } from '../middlewares/errorHandler';

// Extend IUser with the comparePassword method
declare module '../models/User' {
  interface IUser {
    comparePassword(candidatePassword: string): Promise<boolean>;
  }
}

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      const error: CustomError = new Error('User already exists');
      error.statusCode = 400;
      return next(error);
    }
    
    // Create new user
    const user = await User.create({ username, email, password });
    
    // Generate token
    const token = generateToken(user._id.toString());
    
    // Create user object without password
    const userWithoutPassword = user.toObject();
    const { password: _, ...userData } = userWithoutPassword;
    
    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });
    
    res.status(201).json({
      status: 'success',
      token,
      data: {
        user: userData
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    
    // Check for user
    const user = await User.findOne({ email }).select('+password') as IUser & {
      comparePassword: (password: string) => Promise<boolean>;
    };
    
    if (!user) {
      const error: CustomError = new Error('Invalid credentials');
      error.statusCode = 401;
      return next(error);
    }
    
    // Check password
    const isMatch = await (user as any).comparePassword(password);
    
    if (!isMatch) {
      const error: CustomError = new Error('Invalid credentials');
      error.statusCode = 401;
      return next(error);
    }
    
    // Generate token
    const token = generateToken(user._id.toString());
    
    // Create user object without password
    const userWithoutPassword = user.toObject();
    const { password: _, ...userData } = userWithoutPassword;
    
    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });
    
    res.status(200).json({
      status: 'success',
      token,
      data: {
        user: userData
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Clear cookie
    res.clearCookie('token');
    
    res.status(200).json({
      status: 'success',
      message: 'Logged out successfully'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user?.id);
    
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
