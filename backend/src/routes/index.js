const express = require('express');
const authRoutes = require('./authRoutes');
const problemRoutes = require('./problemRoutes');
const contestRoutes = require('./contestRoutes');
const submissionRoutes = require('./submissionRoutes');
const leaderboardRoutes = require('./leaderboardRoutes');
const roomRoutes = require('./roomRoutes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/problems', problemRoutes);
router.use('/contests', contestRoutes);
router.use('/submissions', submissionRoutes);
router.use('/leaderboard', leaderboardRoutes);
router.use('/rooms', roomRoutes);

router.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

module.exports = router;
