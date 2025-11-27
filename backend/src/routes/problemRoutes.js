const express = require('express');
const ProblemController = require('../controllers/problemController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.get('/', authMiddleware, ProblemController.getAll);
router.get('/:id', authMiddleware, ProblemController.getById);
router.get('/slug/:slug', authMiddleware, ProblemController.getBySlug);
router.post('/', authMiddleware, ProblemController.create);

module.exports = router;
