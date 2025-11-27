const AuthService = require('../services/authService');
const { validationResult } = require('express-validator');

class AuthController {
  static async register(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { username, email, password, full_name } = req.body;
      const result = await AuthService.register({ username, email, password, full_name });

      res.status(201).json({
        message: 'User registered successfully',
        user: result.user,
        token: result.token
      });
    } catch (error) {
      next(error);
    }
  }

  static async login(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;
      const result = await AuthService.login(email, password);

      res.json({
        message: 'Login successful',
        user: result.user,
        token: result.token
      });
    } catch (error) {
      next(error);
    }
  }

  static async getProfile(req, res, next) {
    try {
      const User = require('../models/User');
      const user = await User.findById(req.user.userId);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({ user });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuthController;
