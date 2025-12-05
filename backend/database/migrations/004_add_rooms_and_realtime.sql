-- Add execution metrics to submissions
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS execution_time_ms INTEGER;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS memory_used_kb INTEGER;

-- Create contest_rooms table
CREATE TABLE IF NOT EXISTS contest_rooms (
  id SERIAL PRIMARY KEY,
  contest_id INTEGER REFERENCES contests(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  room_code VARCHAR(10) UNIQUE NOT NULL,
  max_participants INTEGER DEFAULT 20,
  status VARCHAR(20) DEFAULT 'waiting' CHECK (status IN ('waiting', 'active', 'completed')),
  start_time TIMESTAMP,
  end_time TIMESTAMP,
  created_by INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create room_participants table
CREATE TABLE IF NOT EXISTS room_participants (
  id SERIAL PRIMARY KEY,
  room_id INTEGER REFERENCES contest_rooms(id) ON DELETE CASCADE NOT NULL,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  score INTEGER DEFAULT 0,
  rank INTEGER,
  problems_solved INTEGER DEFAULT 0,
  last_submission_at TIMESTAMP,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_ready BOOLEAN DEFAULT FALSE,
  UNIQUE(room_id, user_id)
);

-- Create room_chat_messages table
CREATE TABLE IF NOT EXISTS room_chat_messages (
  id SERIAL PRIMARY KEY,
  room_id INTEGER REFERENCES contest_rooms(id) ON DELETE CASCADE NOT NULL,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create room_problem_attempts table
CREATE TABLE IF NOT EXISTS room_problem_attempts (
  id SERIAL PRIMARY KEY,
  room_id INTEGER REFERENCES contest_rooms(id) ON DELETE CASCADE NOT NULL,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  problem_id INTEGER REFERENCES problems(id) ON DELETE CASCADE NOT NULL,
  submission_id INTEGER REFERENCES submissions(id) ON DELETE SET NULL,
  time_taken INTEGER,
  points_earned INTEGER DEFAULT 0,
  completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_contest_rooms_status ON contest_rooms(status);
CREATE INDEX IF NOT EXISTS idx_contest_rooms_room_code ON contest_rooms(room_code);
CREATE INDEX IF NOT EXISTS idx_room_participants_room_id ON room_participants(room_id);
CREATE INDEX IF NOT EXISTS idx_room_participants_user_id ON room_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_room_participants_score ON room_participants(room_id, score DESC);
CREATE INDEX IF NOT EXISTS idx_room_chat_messages_room_id ON room_chat_messages(room_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_room_problem_attempts_room_user ON room_problem_attempts(room_id, user_id);

-- Function to update room participant rank
CREATE OR REPLACE FUNCTION update_room_participant_ranks()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE room_participants
  SET rank = subquery.rank
  FROM (
    SELECT
      id,
      ROW_NUMBER() OVER (PARTITION BY room_id ORDER BY score DESC, last_submission_at ASC) as rank
    FROM room_participants
    WHERE room_id = NEW.room_id
  ) AS subquery
  WHERE room_participants.id = subquery.id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update ranks when score changes
DROP TRIGGER IF EXISTS trigger_update_room_ranks ON room_participants;
CREATE TRIGGER trigger_update_room_ranks
  AFTER INSERT OR UPDATE OF score ON room_participants
  FOR EACH ROW
  EXECUTE FUNCTION update_room_participant_ranks();

-- Function to generate unique room code
CREATE OR REPLACE FUNCTION generate_room_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..6 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;
