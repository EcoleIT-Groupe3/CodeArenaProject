/*
  # Add Real-time Competition Features

  1. New Tables
    - `contest_rooms` - Multiplayer rooms for live competitions
      - `id` (uuid, primary key)
      - `contest_id` (uuid, foreign key to contests)
      - `name` (text) - Room name
      - `room_code` (text, unique) - 6-character join code
      - `max_participants` (int) - Maximum number of participants
      - `status` (text) - 'waiting', 'active', 'completed'
      - `start_time` (timestamptz) - When the room starts
      - `end_time` (timestamptz) - When the room ends
      - `created_by` (uuid, foreign key to auth.users)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `room_participants` - Track participants in each room
      - `id` (uuid, primary key)
      - `room_id` (uuid, foreign key to contest_rooms)
      - `user_id` (uuid, foreign key to auth.users)
      - `score` (int) - Current score in the room
      - `rank` (int) - Current rank in the room
      - `problems_solved` (int) - Number of problems solved
      - `last_submission_at` (timestamptz) - Time of last submission
      - `joined_at` (timestamptz)
      - `is_ready` (boolean) - Ready status

    - `room_chat_messages` - Chat messages within rooms
      - `id` (uuid, primary key)
      - `room_id` (uuid, foreign key to contest_rooms)
      - `user_id` (uuid, foreign key to auth.users)
      - `message` (text) - Chat message content
      - `created_at` (timestamptz)

    - `room_problem_attempts` - Track problem solving in rooms
      - `id` (uuid, primary key)
      - `room_id` (uuid, foreign key to contest_rooms)
      - `user_id` (uuid, foreign key to auth.users)
      - `problem_id` (uuid, foreign key to problems)
      - `submission_id` (uuid, foreign key to submissions)
      - `time_taken` (int) - Seconds taken to solve
      - `points_earned` (int) - Points earned for this problem
      - `completed_at` (timestamptz)

  2. Modifications
    - Add `execution_time_ms` to submissions for performance tracking
    - Add `memory_used_kb` to submissions for efficiency tracking
    - Enable realtime on all new tables

  3. Security
    - Enable RLS on all new tables
    - Add policies for authenticated users
    - Restrict write access based on room membership
    - Allow read access to room participants only

  4. Indexes
    - Add indexes for efficient querying
    - Add indexes for real-time performance
*/

-- Add execution metrics to submissions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'submissions' AND column_name = 'execution_time_ms'
  ) THEN
    ALTER TABLE submissions ADD COLUMN execution_time_ms int;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'submissions' AND column_name = 'memory_used_kb'
  ) THEN
    ALTER TABLE submissions ADD COLUMN memory_used_kb int;
  END IF;
END $$;

-- Create contest_rooms table
CREATE TABLE IF NOT EXISTS contest_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contest_id uuid REFERENCES contests(id) ON DELETE CASCADE,
  name text NOT NULL,
  room_code text UNIQUE NOT NULL,
  max_participants int DEFAULT 20,
  status text DEFAULT 'waiting' CHECK (status IN ('waiting', 'active', 'completed')),
  start_time timestamptz,
  end_time timestamptz,
  created_by uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create room_participants table
CREATE TABLE IF NOT EXISTS room_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid REFERENCES contest_rooms(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  score int DEFAULT 0,
  rank int,
  problems_solved int DEFAULT 0,
  last_submission_at timestamptz,
  joined_at timestamptz DEFAULT now(),
  is_ready boolean DEFAULT false,
  UNIQUE(room_id, user_id)
);

-- Create room_chat_messages table
CREATE TABLE IF NOT EXISTS room_chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid REFERENCES contest_rooms(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create room_problem_attempts table
CREATE TABLE IF NOT EXISTS room_problem_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid REFERENCES contest_rooms(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  problem_id uuid REFERENCES problems(id) ON DELETE CASCADE NOT NULL,
  submission_id uuid REFERENCES submissions(id) ON DELETE SET NULL,
  time_taken int,
  points_earned int DEFAULT 0,
  completed_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_contest_rooms_status ON contest_rooms(status);
CREATE INDEX IF NOT EXISTS idx_contest_rooms_room_code ON contest_rooms(room_code);
CREATE INDEX IF NOT EXISTS idx_room_participants_room_id ON room_participants(room_id);
CREATE INDEX IF NOT EXISTS idx_room_participants_user_id ON room_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_room_participants_score ON room_participants(room_id, score DESC);
CREATE INDEX IF NOT EXISTS idx_room_chat_messages_room_id ON room_chat_messages(room_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_room_problem_attempts_room_user ON room_problem_attempts(room_id, user_id);

-- Enable Row Level Security
ALTER TABLE contest_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_problem_attempts ENABLE ROW LEVEL SECURITY;

-- Policies for contest_rooms
CREATE POLICY "Users can view active and waiting rooms"
  ON contest_rooms FOR SELECT
  TO authenticated
  USING (status IN ('waiting', 'active'));

CREATE POLICY "Users can create rooms"
  ON contest_rooms FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Room creators can update their rooms"
  ON contest_rooms FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Room creators can delete their rooms"
  ON contest_rooms FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

-- Policies for room_participants
CREATE POLICY "Users can view participants in rooms they joined"
  ON room_participants FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM room_participants rp
      WHERE rp.room_id = room_participants.room_id
      AND rp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can join rooms"
  ON room_participants FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own participation"
  ON room_participants FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave rooms"
  ON room_participants FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for room_chat_messages
CREATE POLICY "Room participants can view chat messages"
  ON room_chat_messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM room_participants
      WHERE room_participants.room_id = room_chat_messages.room_id
      AND room_participants.user_id = auth.uid()
    )
  );

CREATE POLICY "Room participants can send messages"
  ON room_chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM room_participants
      WHERE room_participants.room_id = room_chat_messages.room_id
      AND room_participants.user_id = auth.uid()
    )
  );

-- Policies for room_problem_attempts
CREATE POLICY "Room participants can view attempts"
  ON room_problem_attempts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM room_participants
      WHERE room_participants.room_id = room_problem_attempts.room_id
      AND room_participants.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create their own attempts"
  ON room_problem_attempts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

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
RETURNS text AS $$
DECLARE
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result text := '';
  i int;
BEGIN
  FOR i IN 1..6 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Enable realtime for all new tables
ALTER PUBLICATION supabase_realtime ADD TABLE contest_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE room_participants;
ALTER PUBLICATION supabase_realtime ADD TABLE room_chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE room_problem_attempts;
