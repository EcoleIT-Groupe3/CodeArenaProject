-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(100),
  avatar_url TEXT,
  bio TEXT,
  country VARCHAR(50),
  rating INTEGER DEFAULT 0,
  problems_solved INTEGER DEFAULT 0,
  contests_participated INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create problems table
CREATE TABLE IF NOT EXISTS problems (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  slug VARCHAR(200) UNIQUE NOT NULL,
  description TEXT NOT NULL,
  difficulty VARCHAR(20) NOT NULL CHECK (difficulty IN ('Facile', 'Moyen', 'Difficile')),
  category VARCHAR(50) NOT NULL,
  points INTEGER NOT NULL,
  acceptance_rate DECIMAL(5,2) DEFAULT 0,
  total_submissions INTEGER DEFAULT 0,
  solved_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create contests table
CREATE TABLE IF NOT EXISTS contests (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  status VARCHAR(20) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'completed')),
  participants_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create submissions table
CREATE TABLE IF NOT EXISTS submissions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  problem_id INTEGER REFERENCES problems(id) ON DELETE CASCADE NOT NULL,
  code TEXT NOT NULL,
  language VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  execution_time INTEGER,
  memory_used INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create contest_participants table
CREATE TABLE IF NOT EXISTS contest_participants (
  id SERIAL PRIMARY KEY,
  contest_id INTEGER REFERENCES contests(id) ON DELETE CASCADE NOT NULL,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  score INTEGER DEFAULT 0,
  rank INTEGER,
  problems_solved INTEGER DEFAULT 0,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(contest_id, user_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_problems_slug ON problems(slug);
CREATE INDEX IF NOT EXISTS idx_problems_difficulty ON problems(difficulty);
CREATE INDEX IF NOT EXISTS idx_submissions_user_id ON submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_problem_id ON submissions(problem_id);
CREATE INDEX IF NOT EXISTS idx_contest_participants_contest_id ON contest_participants(contest_id);
CREATE INDEX IF NOT EXISTS idx_contest_participants_user_id ON contest_participants(user_id);
