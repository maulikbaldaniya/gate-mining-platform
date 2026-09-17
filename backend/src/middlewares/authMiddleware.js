const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');
const ApiResponse = require('../utils/apiResponse');
const db = require('../models');

async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return ApiResponse.error(res, 'Authentication token missing or malformed', 401, 'UNAUTHORIZED');
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, jwtConfig.accessSecret);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return ApiResponse.error(res, 'Access token expired', 401, 'TOKEN_EXPIRED');
      }
      return ApiResponse.error(res, 'Invalid access token', 401, 'INVALID_TOKEN');
    }

    const user = await db.User.findByPk(decoded.userId);
    if (!user) {
      return ApiResponse.error(res, 'User no longer exists', 401, 'USER_NOT_FOUND');
    }

    req.user = user;
    next();
  } catch (error) {
    return ApiResponse.error(res, 'Authentication failed', 500, 'AUTH_ERROR');
  }
}

module.exports = {
  authenticate,
};
