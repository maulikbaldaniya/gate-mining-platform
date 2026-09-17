const jwt = require('jsonwebtoken');
const db = require('../models');
const jwtConfig = require('../config/jwt');
const streakService = require('./streakService');

function generateTokens(user) {
  const payload = { userId: user.id, email: user.email };
  const accessToken = jwt.sign(payload, jwtConfig.accessSecret, {
    expiresIn: jwtConfig.accessExpiresIn,
  });
  const refreshToken = jwt.sign(payload, jwtConfig.refreshSecret, {
    expiresIn: jwtConfig.refreshExpiresIn,
  });
  return { accessToken, refreshToken };
}

async function register(data) {
  const existingUser = await db.User.findOne({ where: { email: data.email } });
  if (existingUser) {
    const error = new Error('An account with this email already exists');
    error.statusCode = 409;
    error.errorCode = 'USER_EXISTS';
    throw error;
  }

  const user = await db.User.create({
    name: data.name,
    email: data.email,
    password_hash: data.password, // Hook hashes it
    target_exam: data.target_exam || 'GATE 2027 Mining Engineering (MN)',
    current_day: 1,
    start_date: new Date(),
  });

  // Initialize user streak
  await db.UserStreak.create({
    user_id: user.id,
    current_streak: 1,
    longest_streak: 1,
    last_active_date: new Date().toISOString().split('T')[0],
    total_days_studied: 1,
    badges: ['Welcome Miner!'],
  });

  const tokens = generateTokens(user);
  return { user: user.toJSON(), tokens };
}

async function login(email, password) {
  const user = await db.User.findOne({ where: { email } });
  if (!user) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    error.errorCode = 'INVALID_CREDENTIALS';
    throw error;
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    error.errorCode = 'INVALID_CREDENTIALS';
    throw error;
  }

  // Update streak
  await streakService.updateUserStreak(user.id);

  const tokens = generateTokens(user);
  return { user: user.toJSON(), tokens };
}

async function refreshAccessToken(refreshToken) {
  try {
    const decoded = jwt.verify(refreshToken, jwtConfig.refreshSecret);
    const user = await db.User.findByPk(decoded.userId);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      error.errorCode = 'USER_NOT_FOUND';
      throw error;
    }
    const tokens = generateTokens(user);
    return tokens;
  } catch (err) {
    const error = new Error('Invalid or expired refresh token');
    error.statusCode = 401;
    error.errorCode = 'INVALID_REFRESH_TOKEN';
    throw error;
  }
}

module.exports = {
  register,
  login,
  refreshAccessToken,
  generateTokens,
};
