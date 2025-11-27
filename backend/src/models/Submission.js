const pool = require('../config/database');

class Submission {
  static async create(data) {
    const query = `
      INSERT INTO submissions (user_id, problem_id, code, language, status, execution_time, memory_used)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const values = [
      data.user_id,
      data.problem_id,
      data.code,
      data.language,
      data.status || 'pending',
      data.execution_time || null,
      data.memory_used || null
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findById(id) {
    const query = 'SELECT * FROM submissions WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async findByUser(userId, limit = 20) {
    const query = `
      SELECT s.*, p.title as problem_title, p.difficulty, p.points
      FROM submissions s
      JOIN problems p ON s.problem_id = p.id
      WHERE s.user_id = $1
      ORDER BY s.created_at DESC
      LIMIT $2
    `;
    const result = await pool.query(query, [userId, limit]);
    return result.rows;
  }

  static async findByProblem(problemId) {
    const query = `
      SELECT s.*, u.username
      FROM submissions s
      JOIN users u ON s.user_id = u.id
      WHERE s.problem_id = $1
      ORDER BY s.created_at DESC
    `;
    const result = await pool.query(query, [problemId]);
    return result.rows;
  }

  static async updateStatus(id, status, executionTime = null, memoryUsed = null) {
    const query = `
      UPDATE submissions
      SET status = $2, execution_time = $3, memory_used = $4
      WHERE id = $1
      RETURNING *
    `;
    const result = await pool.query(query, [id, status, executionTime, memoryUsed]);
    return result.rows[0];
  }
}

module.exports = Submission;
