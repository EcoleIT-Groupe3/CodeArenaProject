const Submission = require('../models/Submission');
const Problem = require('../models/Problem');
const User = require('../models/User');
const CodeExecutionService = require('./codeExecutionService');

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

    const result = await this.evaluateSubmission(submission.id, code, language, problem);

    if (result.status === 'accepted') {
      await this.updateUserStats(userId, problem);
    }

    await Problem.updateStats(problemId);

    return result;
  }

  static async evaluateSubmission(submissionId, code, language, problem) {
    try {
      const testCases = problem.test_cases || [];

      if (testCases.length === 0) {
        throw new Error('No test cases defined for this problem');
      }

      const executionResult = await CodeExecutionService.executeCode(
        code,
        language,
        testCases
      );

      return await Submission.updateStatus(
        submissionId,
        executionResult.status,
        executionResult.executionTime,
        executionResult.memoryUsed
      );
    } catch (error) {
      return await Submission.updateStatus(
        submissionId,
        'error',
        0,
        0
      );
    }
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
