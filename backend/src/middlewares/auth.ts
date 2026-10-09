import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { CustomError } from './errorHandler';

export interface JwtPayload {
  id: string;
  iat?: number;
  exp?: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_change_in_production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '30d';

// Generate JWT token
export const generateToken = (id: string): string => {
  return jwt.sign({ id }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
  });
};

// Protect routes - require authentication
export const protect = async (req: Request, res: Response, next: NextFunction) => {
  let token;
  
  // Check for token in cookies or Authorization header
  if (req.cookies?.token) {
    token = req.cookies.token;
  } else if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    const error: CustomError = new Error('Not authorized, no token');
    error.statusCode = 401;
    return next(error);
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    
    // Get user from token
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      const error: CustomError = new Error('Not authorized, user not found');
      error.statusCode = 401;
      return next(error);
    }
    
    // Add user to request
    req.user = decoded;
    next();
  } catch (err) {
    const error: CustomError = new Error('Not authorized, token failed');
    error.statusCode = 401;
    return next(error);
  }
};

// Check if user is owner of resource
export const isOwner = (model: any, idField: string = 'id') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const resource = await model.findById(req.params.id);
      
      if (!resource) {
        const error: CustomError = new Error('Resource not found');
        error.statusCode = 404;
        return next(error);
      }
      
      // Check if user is owner
      const userId = req.user?.id;
      const resourceUserId = resource[idField].toString();
      
      if (userId !== resourceUserId) {
        const error: CustomError = new Error('Not authorized to access this resource');
        error.statusCode = 403;
        return next(error);
      }
      
      next();
    } catch (err) {
      next(err);
    }
  };
};
