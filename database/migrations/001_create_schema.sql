/*
  # CodeArena Platform Schema - Migration 001

  ## Description
  Ce script crée la structure complète de la base de données pour la plateforme CodeArena.

  ## Tables créées

  1. **users** - Profils utilisateurs
     - Stocke les informations des utilisateurs
     - Gère les scores et classements
     - Intégré avec Supabase Auth

  2. **problems** - Problèmes de programmation
     - Défis de code avec descriptions
     - Cas de test en format JSON
     - Limites de temps et mémoire

  3. **contests** - Concours de programmation
     - Événements avec dates de début/fin
     - Association avec plusieurs problèmes
     - Suivi du statut (à venir, actif, terminé)

  4. **contest_participants** - Participants aux concours
     - Inscription aux concours
     - Scores individuels par concours
     - Classement par concours

  5. **submissions** - Soumissions de code
     - Code soumis par les utilisateurs
     - Résultats d'exécution
     - Métriques de performance

  ## Sécurité
  - Row Level Security (RLS) activé sur toutes les tables
  - Politiques d'accès restrictives
  - Authentification requise pour la plupart des opérations
*/

-- =====================================================
-- TABLE: users
-- =====================================================

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  score integer DEFAULT 0,
  rank integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

COMMENT ON TABLE users IS 'Profils utilisateurs avec scores et classements';
COMMENT ON COLUMN users.username IS 'Nom d''utilisateur unique';
COMMENT ON COLUMN users.score IS 'Score total cumulé';
COMMENT ON COLUMN users.rank IS 'Classement global';

-- =====================================================
-- TABLE: problems
-- =====================================================

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

COMMENT ON TABLE problems IS 'Problèmes de programmation avec cas de test';
COMMENT ON COLUMN problems.difficulty IS 'Easy, Medium, ou Hard';
COMMENT ON COLUMN problems.test_cases IS 'Array JSON de {input, output}';
COMMENT ON COLUMN problems.time_limit IS 'Limite de temps en millisecondes';
COMMENT ON COLUMN problems.memory_limit IS 'Limite de mémoire en MB';

-- =====================================================
-- TABLE: contests
-- =====================================================

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

COMMENT ON TABLE contests IS 'Concours de programmation';
COMMENT ON COLUMN contests.status IS 'upcoming, active, ou completed';
COMMENT ON COLUMN contests.problem_ids IS 'Array JSON des IDs de problèmes';

-- =====================================================
-- TABLE: contest_participants
-- =====================================================

CREATE TABLE IF NOT EXISTS contest_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contest_id uuid REFERENCES contests(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  score integer DEFAULT 0,
  rank integer DEFAULT 0,
  joined_at timestamptz DEFAULT now(),
  UNIQUE(contest_id, user_id)
);

COMMENT ON TABLE contest_participants IS 'Participation aux concours';
COMMENT ON COLUMN contest_participants.score IS 'Score dans ce concours spécifique';
COMMENT ON COLUMN contest_participants.rank IS 'Classement dans ce concours';

-- =====================================================
-- TABLE: submissions
-- =====================================================

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

COMMENT ON TABLE submissions IS 'Soumissions de code des utilisateurs';
COMMENT ON COLUMN submissions.status IS 'pending, running, accepted, wrong_answer, error, timeout';
COMMENT ON COLUMN submissions.language IS 'javascript, python, java, etc.';
COMMENT ON COLUMN submissions.result IS 'Résultats détaillés des cas de test';
COMMENT ON COLUMN submissions.execution_time IS 'Temps d''exécution en millisecondes';
COMMENT ON COLUMN submissions.memory_used IS 'Mémoire utilisée en MB';

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE contests ENABLE ROW LEVEL SECURITY;
ALTER TABLE contest_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLICIES: users
-- =====================================================

CREATE POLICY "Users can read all user profiles"
  ON users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- =====================================================
-- POLICIES: problems
-- =====================================================

CREATE POLICY "Anyone can read problems"
  ON problems FOR SELECT
  TO authenticated
  USING (true);

-- =====================================================
-- POLICIES: contests
-- =====================================================

CREATE POLICY "Anyone can read contests"
  ON contests FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create contests"
  ON contests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- =====================================================
-- POLICIES: contest_participants
-- =====================================================

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

-- =====================================================
-- POLICIES: submissions
-- =====================================================

CREATE POLICY "Users can read all submissions"
  ON submissions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create submissions"
  ON submissions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_submissions_user_id ON submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_problem_id ON submissions(problem_id);
CREATE INDEX IF NOT EXISTS idx_submissions_contest_id ON submissions(contest_id);
CREATE INDEX IF NOT EXISTS idx_contest_participants_contest_id ON contest_participants(contest_id);
CREATE INDEX IF NOT EXISTS idx_contest_participants_user_id ON contest_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_users_score ON users(score DESC);
CREATE INDEX IF NOT EXISTS idx_problems_difficulty ON problems(difficulty);
CREATE INDEX IF NOT EXISTS idx_contests_status ON contests(status);
CREATE INDEX IF NOT EXISTS idx_contests_start_time ON contests(start_time);

-- =====================================================
-- FIN DE LA MIGRATION
-- =====================================================
