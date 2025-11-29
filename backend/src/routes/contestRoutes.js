const express = require('express');
const ContestController = require('../controllers/contestController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.get('/', authMiddleware, ContestController.getAll);
router.get('/:id', authMiddleware, ContestController.getById);
router.get('/:id/participants', authMiddleware, ContestController.getParticipants);
router.post('/:id/join', authMiddleware, ContestController.joinContest);

module.exports = router;
