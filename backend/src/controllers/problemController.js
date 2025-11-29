const Problem = require('../models/Problem');

class ProblemController {
  static async getAll(req, res, next) {
    try {
      const { difficulty, category, search } = req.query;
      const problems = await Problem.findAll({ difficulty, category, search });
      res.json({ problems });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const problem = await Problem.findById(req.params.id);
      if (!problem) {
        return res.status(404).json({ error: 'Problem not found' });
      }
      res.json({ problem });
    } catch (error) {
      next(error);
    }
  }

  static async getBySlug(req, res, next) {
    try {
      const problem = await Problem.findBySlug(req.params.slug);
      if (!problem) {
        return res.status(404).json({ error: 'Problem not found' });
      }
      res.json({ problem });
    } catch (error) {
      next(error);
    }
  }

  static async create(req, res, next) {
    try {
      const problem = await Problem.create(req.body);
      res.status(201).json({ problem });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ProblemController;
