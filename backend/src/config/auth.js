require('dotenv').config();

module.exports = {
  jwtSecret: process.env.JWT_SECRET || 'fallback-secret-key',
  jwtExpire: process.env.JWT_EXPIRE || '7d',
};
