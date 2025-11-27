const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { jwtSecret, jwtExpire } = require('../config/auth');

class AuthService {
  static async register(userData) {
    const existingUser = await User.findByEmail(userData.email);
    if (existingUser) {
      throw new Error('Email already registered');
    }

    const existingUsername = await User.findByUsername(userData.username);
    if (existingUsername) {
      throw new Error('Username already taken');
    }

    const user = await User.create(userData);
    const token = this.generateToken(user.id);

    return { user, token };
  }

  static async login(email, password) {
    const user = await User.findByEmail(email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isValidPassword = await User.comparePassword(password, user.password);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    const token = this.generateToken(user.id);

    const { password: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
  }

  static generateToken(userId) {
    return jwt.sign({ userId }, jwtSecret, { expiresIn: jwtExpire });
  }

  static verifyToken(token) {
    return jwt.verify(token, jwtSecret);
  }
}

module.exports = AuthService;
