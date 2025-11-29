const User = require('../models/User');

class LeaderboardController {
  static async getLeaderboard(req, res, next) {
    try {
      const limit = parseInt(req.query.limit) || 50;
      const leaderboard = await User.getLeaderboard(limit);
      res.json({ leaderboard });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = LeaderboardController;
