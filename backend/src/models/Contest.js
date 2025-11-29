const pool = require('../config/database');

class Contest {
  static async findAll(status = null) {
    let query = 'SELECT * FROM contests';
    const values = [];

    if (status) {
      query += ' WHERE status = $1';
      values.push(status);
    }

    query += ' ORDER BY start_date DESC';

    const result = await pool.query(query, values);
    return result.rows;
  }

  static async findById(id) {
    const query = 'SELECT * FROM contests WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async create(data) {
    const query = `
      INSERT INTO contests (title, description, start_date, end_date, status)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const values = [
      data.title,
      data.description,
      data.start_date,
      data.end_date,
      data.status || 'upcoming'
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async getParticipants(contestId) {
    const query = `
      SELECT cp.*, u.username, u.avatar_url, u.country
      FROM contest_participants cp
      JOIN users u ON cp.user_id = u.id
      WHERE cp.contest_id = $1
      ORDER BY cp.rank ASC, cp.score DESC
    `;
    const result = await pool.query(query, [contestId]);
    return result.rows;
  }

  static async joinContest(contestId, userId) {
    const query = `
      INSERT INTO contest_participants (contest_id, user_id)
      VALUES ($1, $2)
      ON CONFLICT (contest_id, user_id) DO NOTHING
      RETURNING *
    `;
    const result = await pool.query(query, [contestId, userId]);

    await pool.query(
      'UPDATE contests SET participants_count = participants_count + 1 WHERE id = $1',
      [contestId]
    );

    return result.rows[0];
  }
}

module.exports = Contest;
