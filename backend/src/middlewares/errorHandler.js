const logger = require('../utils/logger');
const ApiResponse = require('../utils/apiResponse');

function errorHandler(err, req, res, next) {
  logger.error(`Unhandled Error at [${req.method}] ${req.originalUrl}:`, err);

  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal server error occurred';
  const errorCode = err.errorCode || 'INTERNAL_SERVER_ERROR';

  const details = process.env.NODE_ENV === 'development' ? err.stack : undefined;

  return ApiResponse.error(res, message, statusCode, errorCode, details);
}

module.exports = errorHandler;
