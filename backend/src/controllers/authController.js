const authService = require('../services/authService');
const ApiResponse = require('../utils/apiResponse');

async function register(req, res, next) {
  try {
    const result = await authService.register(req.body);
    return ApiResponse.success(res, 'User registered successfully', result, 201);
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    return ApiResponse.success(res, 'Login successful', result, 200);
  } catch (error) {
    next(error);
  }
}

async function refresh(req, res, next) {
  try {
    const { refreshToken } = req.body;
    const tokens = await authService.refreshAccessToken(refreshToken);
    return ApiResponse.success(res, 'Token refreshed successfully', tokens, 200);
  } catch (error) {
    next(error);
  }
}

async function getMe(req, res, next) {
  try {
    const user = req.user.toJSON();
    return ApiResponse.success(res, 'Current user profile fetched', { user }, 200);
  } catch (error) {
    next(error);
  }
}

async function logout(req, res, next) {
  try {
    return ApiResponse.success(res, 'Logged out successfully', {}, 200);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  register,
  login,
  refresh,
  getMe,
  logout,
};
