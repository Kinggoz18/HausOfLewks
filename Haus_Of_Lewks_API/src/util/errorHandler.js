/**
 * Global error handler middleware
 * Standardizes error responses using ReturnObject format
 * @param {Error} err - The error object
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
import { ReturnObject } from './returnObject.js';
import logger from './logger.js';

const errorHandler = (err, req, res, next) => {
  logger.error('Global error handler caught an error', err, {
    method: req.method,
    url: req.url,
    statusCode: err.statusCode || 500
  });

  const status = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  const response = ReturnObject(false, message);
  res.status(status).json(response);
};

export default errorHandler;
