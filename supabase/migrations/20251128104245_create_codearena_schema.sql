/*
  # CodeArena Database Schema

  1. New Tables
    - `profiles`
      - `id` (uuid, references auth.users)
      - `username` (text, unique)
      - `full_name` (text)
      - `avatar_url` (text)
      - `bio` (text)
      - `country` (text)
      - `rating` (integer, default 0)
      - `problems_solved` (integer, default 0)
      - `contests_participated` (integer, default 0)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `problems`
      - `id` (uuid, primary key)
      - `title` (text)
      - `slug` (text, unique)
      - `description` (text)
      - `difficulty` (text)
      - `category` (text)
      - `points` (integer)
      - `acceptance_rate` (numeric)
      - `total_submissions` (integer, default 0)
      - `solved_count` (integer, default 0)
      - `created_at` (timestamptz)
    
    - `contests`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `start_date` (timestamptz)
      - `end_date` (timestamptz)
      - `status` (text)
      - `participants_count` (integer, default 0)
      - `created_at` (timestamptz)
    
    - `submissions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `problem_id` (uuid, references problems)
      - `code` (text)
      - `language` (text)
      - `status` (text)
      - `execution_time` (integer)
      - `memory_used` (integer)
      - `created_at` (timestamptz)
    
    - `contest_participants`
      - `id` (uuid, primary key)
      - `contest_id` (uuid, references contests)
      - `user_id` (uuid, references auth.users)
      - `score` (integer, default 0)
      - `rank` (integer)
      - `problems_solved` (integer, default 0)
      - `joined_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add policies for public read access to problems and contests
    - Add policies for users to view submissions and leaderboards
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  full_name text,
  avatar_url text,
  bio text,
  country text,
  rating integer DEFAULT 0,
  problems_solved integer DEFAULT 0,
  contests_participated integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create problems table
CREATE TABLE IF NOT EXISTS problems (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text NOT NULL,
  difficulty text NOT NULL CHECK (difficulty IN ('Facile', 'Moyen', 'Difficile')),
  category text NOT NULL,
  points integer NOT NULL,
  acceptance_rate numeric(5,2) DEFAULT 0,
  total_submissions integer DEFAULT 0,
  solved_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE problems ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view problems"
  ON problems FOR SELECT
  TO authenticated
  USING (true);

-- Create contests table
CREATE TABLE IF NOT EXISTS contests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  status text DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'completed')),
  participants_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE contests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view contests"
  ON contests FOR SELECT
  TO authenticated
  USING (true);

-- Create submissions table
CREATE TABLE IF NOT EXISTS submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  problem_id uuid REFERENCES problems(id) ON DELETE CASCADE NOT NULL,
  code text NOT NULL,
  language text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  execution_time integer,
  memory_used integer,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own submissions"
  ON submissions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create submissions"
  ON submissions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create contest_participants table
CREATE TABLE IF NOT EXISTS contest_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contest_id uuid REFERENCES contests(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  score integer DEFAULT 0,
  rank integer,
  problems_solved integer DEFAULT 0,
  joined_at timestamptz DEFAULT now(),
  UNIQUE(contest_id, user_id)
);

ALTER TABLE contest_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view contest participants"
  ON contest_participants FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can join contests"
  ON contest_participants FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_problems_slug ON problems(slug);
CREATE INDEX IF NOT EXISTS idx_problems_difficulty ON problems(difficulty);
CREATE INDEX IF NOT EXISTS idx_submissions_user_id ON submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_problem_id ON submissions(problem_id);
CREATE INDEX IF NOT EXISTS idx_contest_participants_contest_id ON contest_participants(contest_id);
CREATE INDEX IF NOT EXISTS idx_contest_participants_user_id ON contest_participants(user_id);

-- Create function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'full_name', '')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();