const express = require('express');
const LeaderboardController = require('../controllers/leaderboardController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.get('/', authMiddleware, LeaderboardController.getLeaderboard);

module.exports = router;
