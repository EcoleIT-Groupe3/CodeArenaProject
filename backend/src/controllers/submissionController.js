const SubmissionService = require('../services/submissionService');
const Submission = require('../models/Submission');

class SubmissionController {
  static async submit(req, res, next) {
    try {
      const { problem_id, code, language } = req.body;
      const userId = req.user.userId;

      const result = await SubmissionService.submitCode(userId, problem_id, code, language);

      res.status(201).json({
        message: 'Submission processed',
        submission: result
      });
    } catch (error) {
      next(error);
    }
  }

  static async getUserSubmissions(req, res, next) {
    try {
      const userId = req.user.userId;
      const limit = parseInt(req.query.limit) || 20;

      const submissions = await SubmissionService.getUserSubmissions(userId, limit);

      res.json({ submissions });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const submission = await Submission.findById(req.params.id);

      if (!submission) {
        return res.status(404).json({ error: 'Submission not found' });
      }

      if (submission.user_id !== req.user.userId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      res.json({ submission });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = SubmissionController;
