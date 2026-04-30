// ============================================================
// Global Error Handler
// ============================================================

const logger = require('../utils/logger');

// Custom App Error class
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

// Handle Prisma errors
const handlePrismaError = (err) => {
  // Unique constraint violation
  if (err.code === 'P2002') {
    const field = err.meta?.target?.[0] || 'field';
    return new AppError(`${field} already exists`, 409);
  }
  
  // Record not found
  if (err.code === 'P2025') {
    return new AppError('Record not found', 404);
  }
  
  // Foreign key constraint
  if (err.code === 'P2003') {
    return new AppError('Invalid reference', 400);
  }

  return new AppError('Database error', 500);
};

// Handle JWT errors
const handleJWTError = () => new AppError('Invalid token. Please login again.', 401);
const handleJWTExpiredError = () => new AppError('Token expired. Please login again.', 401);

// Send error response in development
const sendErrorDev = (err, res) => {
  res.status(err.statusCode || 500).json({
    success: false,
    status: err.status,
    error: err.message,
    stack: err.stack,
    details: err
  });
};

// Send error response in production
const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      status: err.status,
      message: err.message
    });
  } else {
    logger.error('ERROR 💥', err);
    res.status(500).json({
      success: false,
      status: 'error',
      message: 'Something went wrong'
    });
  }
};

// 404 handler
const notFound = (req, res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found`, 404));
};

// Global error handler
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log error
  if (process.env.NODE_ENV === 'development') {
    logger.error('Error:', err);
  }

  let error = { ...err, message: err.message };

  // Handle specific error types
  if (err.code?.startsWith('P2')) {
    error = handlePrismaError(err);
  }
  if (err.name === 'JsonWebTokenError') {
    error = handleJWTError();
  }
  if (err.name === 'TokenExpiredError') {
    error = handleJWTExpiredError();
  }
  if (err.name === 'ValidationError') {
    error.statusCode = 400;
  }

  // Send response
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(error, res);
  } else {
    sendErrorProd(error, res);
  }
};

module.exports = { AppError, notFound, errorHandler };
