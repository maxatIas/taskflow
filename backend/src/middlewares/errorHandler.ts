import { Request, Response, NextFunction } from 'express';

export interface CustomError extends Error {
  statusCode?: number;
  status?: string;
  isOperational?: boolean;
}

export const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Set default values
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  err.isOperational = err.isOperational !== undefined ? err.isOperational : true;

  // Log error details
  console.error('Error:', {
    message: err.message,
    statusCode: err.statusCode,
    status: err.status,
    stack: err.stack
  });

  // Send error response
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

// Not found handler
export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    status: 'fail',
    message: `Can't find ${req.originalUrl} on this server!`
  });
};
