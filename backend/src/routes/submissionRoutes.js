const express = require('express');
const SubmissionController = require('../controllers/submissionController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.post('/', authMiddleware, SubmissionController.submit);
router.get('/my-submissions', authMiddleware, SubmissionController.getUserSubmissions);
router.get('/:id', authMiddleware, SubmissionController.getById);

module.exports = router;
