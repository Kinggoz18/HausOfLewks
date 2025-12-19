/**
 * Global error handler middleware
 * Standardizes error responses using ReturnObject format
 * @param {Error} err - The error object
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
import { ReturnObject } from './returnObject.js';

const errorHandler = (err, req, res, next) => {
  console.error(`[Error] ${err?.message ?? err}`);

  const status = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  const response = ReturnObject(false, message);
  res.status(status).json(response);
};

export default errorHandler;
