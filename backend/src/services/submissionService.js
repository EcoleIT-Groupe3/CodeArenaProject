const Submission = require('../models/Submission');
const Problem = require('../models/Problem');
const User = require('../models/User');

class SubmissionService {
  static async submitCode(userId, problemId, code, language) {
    const problem = await Problem.findById(problemId);
    if (!problem) {
      throw new Error('Problem not found');
    }

    const submission = await Submission.create({
      user_id: userId,
      problem_id: problemId,
      code,
      language,
      status: 'pending'
    });

    const result = await this.evaluateSubmission(submission.id, code, problem);

    if (result.status === 'accepted') {
      await this.updateUserStats(userId, problem);
    }

    await Problem.updateStats(problemId);

    return result;
  }

  static async evaluateSubmission(submissionId, code, problem) {
    const executionTime = Math.floor(Math.random() * 50) + 10;
    const memoryUsed = Math.floor(Math.random() * 20) + 30;
    const isAccepted = Math.random() > 0.3;

    const status = isAccepted ? 'accepted' : 'rejected';

    return await Submission.updateStatus(
      submissionId,
      status,
      executionTime,
      memoryUsed
    );
  }

  static async updateUserStats(userId, problem) {
    const user = await User.findById(userId);
    const newRating = user.rating + problem.points;
    const newProblemsSolved = user.problems_solved + 1;

    await User.update(userId, {
      rating: newRating,
      problems_solved: newProblemsSolved
    });
  }

  static async getUserSubmissions(userId, limit = 20) {
    return await Submission.findByUser(userId, limit);
  }
}

module.exports = SubmissionService;
