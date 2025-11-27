/*
  # CodeArena Platform Schema

  1. New Tables
    - `users`
      - `id` (uuid, primary key) - Unique user identifier
      - `username` (text, unique) - User's display name
      - `email` (text, unique) - User's email
      - `password_hash` (text) - Hashed password
      - `score` (integer) - Total user score across all contests
      - `rank` (integer) - User's global ranking
      - `created_at` (timestamptz) - Account creation timestamp
      
    - `problems`
      - `id` (uuid, primary key) - Problem identifier
      - `title` (text) - Problem title
      - `description` (text) - Problem description
      - `difficulty` (text) - Easy, Medium, Hard
      - `test_cases` (jsonb) - Input/output test cases
      - `time_limit` (integer) - Execution time limit in milliseconds
      - `memory_limit` (integer) - Memory limit in MB
      - `created_at` (timestamptz) - Problem creation timestamp
      
    - `contests`
      - `id` (uuid, primary key) - Contest identifier
      - `title` (text) - Contest name
      - `description` (text) - Contest description
      - `start_time` (timestamptz) - Contest start time
      - `end_time` (timestamptz) - Contest end time
      - `problem_ids` (jsonb) - Array of problem IDs
      - `status` (text) - upcoming, active, completed
      - `created_by` (uuid) - User who created the contest
      - `created_at` (timestamptz) - Contest creation timestamp
      
    - `contest_participants`
      - `id` (uuid, primary key) - Participation record ID
      - `contest_id` (uuid) - Reference to contest
      - `user_id` (uuid) - Reference to user
      - `score` (integer) - User's score in this contest
      - `rank` (integer) - User's rank in this contest
      - `joined_at` (timestamptz) - When user joined contest
      
    - `submissions`
      - `id` (uuid, primary key) - Submission identifier
      - `user_id` (uuid) - User who submitted
      - `problem_id` (uuid) - Problem being solved
      - `contest_id` (uuid, nullable) - Contest (if part of contest)
      - `code` (text) - User's code submission
      - `language` (text) - Programming language
      - `status` (text) - pending, running, accepted, wrong_answer, error, timeout
      - `result` (jsonb) - Execution results
      - `score` (integer) - Points earned
      - `execution_time` (integer) - Time taken in ms
      - `memory_used` (integer) - Memory used in MB
      - `submitted_at` (timestamptz) - Submission timestamp

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated user access
    - Add policies for public read access to problems and contests
*/

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  score integer DEFAULT 0,
  rank integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS problems (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  difficulty text DEFAULT 'Medium',
  test_cases jsonb NOT NULL DEFAULT '[]'::jsonb,
  time_limit integer DEFAULT 5000,
  memory_limit integer DEFAULT 256,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS contests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  problem_ids jsonb DEFAULT '[]'::jsonb,
  status text DEFAULT 'upcoming',
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS contest_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contest_id uuid REFERENCES contests(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  score integer DEFAULT 0,
  rank integer DEFAULT 0,
  joined_at timestamptz DEFAULT now(),
  UNIQUE(contest_id, user_id)
);

CREATE TABLE IF NOT EXISTS submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  problem_id uuid REFERENCES problems(id) ON DELETE CASCADE,
  contest_id uuid REFERENCES contests(id) ON DELETE SET NULL,
  code text NOT NULL,
  language text NOT NULL,
  status text DEFAULT 'pending',
  result jsonb DEFAULT '{}'::jsonb,
  score integer DEFAULT 0,
  execution_time integer DEFAULT 0,
  memory_used integer DEFAULT 0,
  submitted_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE contests ENABLE ROW LEVEL SECURITY;
ALTER TABLE contest_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read all user profiles"
  ON users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Anyone can read problems"
  ON problems FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can read contests"
  ON contests FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create contests"
  ON contests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can read contest participants"
  ON contest_participants FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can join contests"
  ON contest_participants FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their participation"
  ON contest_participants FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read all submissions"
  ON submissions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create submissions"
  ON submissions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_submissions_user_id ON submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_problem_id ON submissions(problem_id);
CREATE INDEX IF NOT EXISTS idx_submissions_contest_id ON submissions(contest_id);
CREATE INDEX IF NOT EXISTS idx_contest_participants_contest_id ON contest_participants(contest_id);
CREATE INDEX IF NOT EXISTS idx_contest_participants_user_id ON contest_participants(user_id);