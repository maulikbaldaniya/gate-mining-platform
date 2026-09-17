require('dotenv').config();

module.exports = {
  accessSecret: process.env.JWT_ACCESS_SECRET || 'gate_mining_access_super_secret_key_2027_production_grade',
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'gate_mining_refresh_super_secret_key_2027_production_grade',
  accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '1d',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
};
