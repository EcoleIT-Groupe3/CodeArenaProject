const pool = require('../config/database');

class Problem {
  static async findAll(filters = {}) {
    let query = 'SELECT * FROM problems WHERE 1=1';
    const values = [];
    let paramIndex = 1;

    if (filters.difficulty) {
      query += ` AND difficulty = $${paramIndex}`;
      values.push(filters.difficulty);
      paramIndex++;
    }

    if (filters.category) {
      query += ` AND category = $${paramIndex}`;
      values.push(filters.category);
      paramIndex++;
    }

    if (filters.search) {
      query += ` AND (title ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`;
      values.push(`%${filters.search}%`);
      paramIndex++;
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, values);
    return result.rows;
  }

  static async findById(id) {
    const query = 'SELECT * FROM problems WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async findBySlug(slug) {
    const query = 'SELECT * FROM problems WHERE slug = $1';
    const result = await pool.query(query, [slug]);
    return result.rows[0];
  }

  static async create(data) {
    const query = `
      INSERT INTO problems (title, slug, description, difficulty, category, points)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const values = [
      data.title,
      data.slug,
      data.description,
      data.difficulty,
      data.category,
      data.points
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async updateStats(problemId) {
    const query = `
      UPDATE problems
      SET
        total_submissions = (SELECT COUNT(*) FROM submissions WHERE problem_id = $1),
        solved_count = (SELECT COUNT(DISTINCT user_id) FROM submissions WHERE problem_id = $1 AND status = 'accepted'),
        acceptance_rate = (
          SELECT CASE
            WHEN COUNT(*) = 0 THEN 0
            ELSE ROUND((COUNT(*) FILTER (WHERE status = 'accepted')::DECIMAL / COUNT(*)) * 100, 2)
          END
          FROM submissions WHERE problem_id = $1
        )
      WHERE id = $1
      RETURNING *
    `;
    const result = await pool.query(query, [problemId]);
    return result.rows[0];
  }
}

module.exports = Problem;
