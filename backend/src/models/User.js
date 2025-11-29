const pool = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  static async create({ username, email, password, full_name }) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = `
      INSERT INTO users (username, email, password, full_name)
      VALUES ($1, $2, $3, $4)
      RETURNING id, username, email, full_name, rating, problems_solved, contests_participated, created_at
    `;
    const values = [username, email, hashedPassword, full_name];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows[0];
  }

  static async findByUsername(username) {
    const query = 'SELECT * FROM users WHERE username = $1';
    const result = await pool.query(query, [username]);
    return result.rows[0];
  }

  static async findById(id) {
    const query = `
      SELECT id, username, email, full_name, avatar_url, bio, country,
             rating, problems_solved, contests_participated, created_at
      FROM users WHERE id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async update(id, data) {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    Object.keys(data).forEach(key => {
      if (data[key] !== undefined && key !== 'password' && key !== 'id') {
        fields.push(`${key} = $${paramIndex}`);
        values.push(data[key]);
        paramIndex++;
      }
    });

    if (fields.length === 0) return null;

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `
      UPDATE users SET ${fields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, username, email, full_name, avatar_url, bio, country, rating, problems_solved, contests_participated
    `;

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async getLeaderboard(limit = 50) {
    const query = `
      SELECT id, username, rating, problems_solved, country,
             ROW_NUMBER() OVER (ORDER BY rating DESC) as rank
      FROM users
      ORDER BY rating DESC
      LIMIT $1
    `;
    const result = await pool.query(query, [limit]);
    return result.rows;
  }

  static async comparePassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}

module.exports = User;
