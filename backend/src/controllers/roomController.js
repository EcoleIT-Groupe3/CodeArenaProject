const pool = require('../config/database');

exports.createRoom = async (req, res, next) => {
  try {
    const { contest_id, name, max_participants = 20 } = req.body;
    const userId = req.user.id;

    const roomCode = generateRoomCode();

    const result = await pool.query(
      `INSERT INTO contest_rooms (contest_id, name, room_code, max_participants, created_by)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [contest_id, name, roomCode, max_participants, userId]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

exports.getActiveRooms = async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT r.*, c.title as contest_title, c.description as contest_description,
              u.username as creator_username,
              (SELECT COUNT(*) FROM room_participants WHERE room_id = r.id) as current_participants
       FROM contest_rooms r
       LEFT JOIN contests c ON r.contest_id = c.id
       LEFT JOIN users u ON r.created_by = u.id
       WHERE r.status IN ('waiting', 'active')
       ORDER BY r.created_at DESC`
    );

    res.json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
};

exports.getRoomById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT r.*, c.title as contest_title, c.description as contest_description,
              c.start_date, c.end_date,
              u.username as creator_username
       FROM contest_rooms r
       LEFT JOIN contests c ON r.contest_id = c.id
       LEFT JOIN users u ON r.created_by = u.id
       WHERE r.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

exports.joinRoom = async (req, res, next) => {
  try {
    const { room_code } = req.body;
    const userId = req.user.id;

    const roomResult = await pool.query(
      'SELECT * FROM contest_rooms WHERE room_code = $1',
      [room_code]
    );

    if (roomResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    const room = roomResult.rows[0];

    const participantCount = await pool.query(
      'SELECT COUNT(*) FROM room_participants WHERE room_id = $1',
      [room.id]
    );

    if (parseInt(participantCount.rows[0].count) >= room.max_participants) {
      return res.status(400).json({ success: false, message: 'Room is full' });
    }

    const result = await pool.query(
      `INSERT INTO room_participants (room_id, user_id)
       VALUES ($1, $2)
       ON CONFLICT (room_id, user_id) DO NOTHING
       RETURNING *`,
      [room.id, userId]
    );

    const io = req.app.get('io');
    if (io) {
      io.to(`room:${room.id}`).emit('participant-joined', { roomId: room.id, userId });
    }

    res.json({ success: true, data: room });
  } catch (error) {
    next(error);
  }
};

exports.leaveRoom = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await pool.query(
      'DELETE FROM room_participants WHERE room_id = $1 AND user_id = $2',
      [id, userId]
    );

    res.json({ success: true, message: 'Left room successfully' });
  } catch (error) {
    next(error);
  }
};

exports.getRoomParticipants = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT rp.*, u.username, u.full_name, u.avatar_url, u.rating
       FROM room_participants rp
       LEFT JOIN users u ON rp.user_id = u.id
       WHERE rp.room_id = $1
       ORDER BY rp.score DESC, rp.last_submission_at ASC`,
      [id]
    );

    res.json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
};

exports.updateRoomStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    const roomResult = await pool.query(
      'SELECT created_by FROM contest_rooms WHERE id = $1',
      [id]
    );

    if (roomResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    if (roomResult.rows[0].created_by !== userId) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await pool.query(
      'UPDATE contest_rooms SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [status, id]
    );

    res.json({ success: true, message: 'Room status updated' });
  } catch (error) {
    next(error);
  }
};

exports.getChatMessages = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { limit = 50 } = req.query;

    const result = await pool.query(
      `SELECT m.*, u.username, u.avatar_url
       FROM room_chat_messages m
       LEFT JOIN users u ON m.user_id = u.id
       WHERE m.room_id = $1
       ORDER BY m.created_at DESC
       LIMIT $2`,
      [id, limit]
    );

    res.json({ success: true, data: result.rows.reverse() });
  } catch (error) {
    next(error);
  }
};

exports.sendChatMessage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    const userId = req.user.id;

    const participantCheck = await pool.query(
      'SELECT id FROM room_participants WHERE room_id = $1 AND user_id = $2',
      [id, userId]
    );

    if (participantCheck.rows.length === 0) {
      return res.status(403).json({ success: false, message: 'Not a room participant' });
    }

    const result = await pool.query(
      `INSERT INTO room_chat_messages (room_id, user_id, message)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [id, userId, message]
    );

    const messageWithUser = await pool.query(
      `SELECT m.*, u.username, u.avatar_url
       FROM room_chat_messages m
       LEFT JOIN users u ON m.user_id = u.id
       WHERE m.id = $1`,
      [result.rows[0].id]
    );

    const io = req.app.get('io');
    if (io) {
      io.to(`room:${id}`).emit('new-message', messageWithUser.rows[0]);
    }

    res.json({ success: true, data: messageWithUser.rows[0] });
  } catch (error) {
    next(error);
  }
};

function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

module.exports = exports;
