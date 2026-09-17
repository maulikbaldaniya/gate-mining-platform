/**
 * Standardized API Response Helper
 */
class ApiResponse {
  static success(res, message = 'Success', data = {}, statusCode = 200, pagination = null) {
    const response = {
      success: true,
      message,
      data,
    };
    if (pagination) {
      response.pagination = pagination;
    }
    return res.status(statusCode).json(response);
  }

  static error(res, message = 'An error occurred', statusCode = 500, errorCode = 'INTERNAL_ERROR', details = null) {
    const response = {
      success: false,
      message,
      errorCode,
    };
    if (details) {
      response.details = details;
    }
    return res.status(statusCode).json(response);
  }
}

module.exports = ApiResponse;
