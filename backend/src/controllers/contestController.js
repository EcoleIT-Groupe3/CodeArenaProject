const Contest = require('../models/Contest');

class ContestController {
  static async getAll(req, res, next) {
    try {
      const { status } = req.query;
      const contests = await Contest.findAll(status);
      res.json({ contests });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const contest = await Contest.findById(req.params.id);
      if (!contest) {
        return res.status(404).json({ error: 'Contest not found' });
      }
      res.json({ contest });
    } catch (error) {
      next(error);
    }
  }

  static async getParticipants(req, res, next) {
    try {
      const participants = await Contest.getParticipants(req.params.id);
      res.json({ participants });
    } catch (error) {
      next(error);
    }
  }

  static async joinContest(req, res, next) {
    try {
      const result = await Contest.joinContest(req.params.id, req.user.userId);
      res.json({
        message: 'Successfully joined contest',
        participant: result
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ContestController;
