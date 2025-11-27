/*
  # Système de Défi Quotidien (Daily Challenge)

  ## Vue d'Ensemble
  Implémente un système de défi quotidien où les utilisateurs peuvent:
  - Résoudre des problèmes sélectionnés pour la journée
  - Gagner des points pour chaque problème résolu
  - Voir leur classement journalier
  - Consulter l'historique des défis précédents

  ## Nouvelles Tables

  ### 1. daily_challenges
  Stocke les défis quotidiens avec leurs problèmes associés
  - Chaque défi a une date unique
  - Contient une liste de problem_ids
  - Génération automatique possible

  ### 2. daily_challenge_participants
  Suivi des participants au défi quotidien
  - Score du jour pour chaque utilisateur
  - Rang dans le classement journalier
  - Temps total passé
  - Nombre de problèmes résolus

  ### 3. daily_challenge_submissions
  Soumissions spécifiques au défi quotidien
  - Liées à un défi et un problème spécifiques
  - Tracabilité des tentatives journalières
  - Calcul du score quotidien

  ## Fonctionnalités

  ### Génération Automatique de Défi
  - Sélectionne aléatoirement 3-5 problèmes par jour
  - Mix de difficultés (Easy, Medium, Hard)
  - Un seul défi actif par jour

  ### Calcul du Score Journalier
  - Easy: 100 points
  - Medium: 200 points
  - Hard: 300 points
  - Bonus de vitesse possible

  ### Classement en Temps Réel
  - Mise à jour automatique après chaque soumission
  - Tri par score DESC puis temps total ASC

  ## Sécurité
  - RLS activée sur toutes les tables
  - Les utilisateurs ne peuvent voir que leurs propres données
  - Le leaderboard est accessible à tous les utilisateurs authentifiés
*/

-- =====================================================
-- 1. TABLE: daily_challenges
-- =====================================================

CREATE TABLE IF NOT EXISTS daily_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_date date NOT NULL UNIQUE,
  problem_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
  title text NOT NULL DEFAULT 'Daily Challenge',
  description text DEFAULT '',
  total_participants integer DEFAULT 0,
  status text DEFAULT 'active' CHECK (status IN ('active', 'completed')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE daily_challenges ENABLE ROW LEVEL SECURITY;

-- Politique: Tout le monde peut voir les défis
CREATE POLICY "Anyone can view daily challenges"
  ON daily_challenges FOR SELECT
  TO authenticated
  USING (true);

-- Index pour recherche rapide par date
CREATE INDEX IF NOT EXISTS idx_daily_challenges_date 
  ON daily_challenges(challenge_date DESC);

-- =====================================================
-- 2. TABLE: daily_challenge_participants
-- =====================================================

CREATE TABLE IF NOT EXISTS daily_challenge_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id uuid NOT NULL REFERENCES daily_challenges(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  daily_score integer DEFAULT 0,
  daily_rank integer DEFAULT 0,
  problems_solved integer DEFAULT 0,
  total_time integer DEFAULT 0,
  joined_at timestamptz DEFAULT now(),
  UNIQUE(challenge_id, user_id)
);

ALTER TABLE daily_challenge_participants ENABLE ROW LEVEL SECURITY;

-- Politique: Les utilisateurs peuvent voir tous les participants
CREATE POLICY "Users can view all participants"
  ON daily_challenge_participants FOR SELECT
  TO authenticated
  USING (true);

-- Politique: Les utilisateurs peuvent insérer leur propre participation
CREATE POLICY "Users can join challenges"
  ON daily_challenge_participants FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Index pour le leaderboard
CREATE INDEX IF NOT EXISTS idx_daily_participants_leaderboard
  ON daily_challenge_participants(challenge_id, daily_score DESC, total_time ASC);

CREATE INDEX IF NOT EXISTS idx_daily_participants_user
  ON daily_challenge_participants(user_id, challenge_id);

-- =====================================================
-- 3. TABLE: daily_challenge_submissions
-- =====================================================

CREATE TABLE IF NOT EXISTS daily_challenge_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id uuid NOT NULL REFERENCES daily_challenges(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  problem_id uuid NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
  code text NOT NULL,
  language text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'wrong_answer', 'error')),
  result jsonb DEFAULT '{}'::jsonb,
  score integer DEFAULT 0,
  execution_time integer DEFAULT 0,
  submitted_at timestamptz DEFAULT now()
);

ALTER TABLE daily_challenge_submissions ENABLE ROW LEVEL SECURITY;

-- Politique: Les utilisateurs peuvent voir leurs propres soumissions
CREATE POLICY "Users can view own challenge submissions"
  ON daily_challenge_submissions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Politique: Les utilisateurs peuvent créer leurs soumissions
CREATE POLICY "Users can create challenge submissions"
  ON daily_challenge_submissions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Index pour récupération rapide
CREATE INDEX IF NOT EXISTS idx_daily_submissions_user
  ON daily_challenge_submissions(user_id, challenge_id, submitted_at DESC);

CREATE INDEX IF NOT EXISTS idx_daily_submissions_problem
  ON daily_challenge_submissions(challenge_id, problem_id, user_id);

-- =====================================================
-- 4. FONCTION: Calculer les points du défi quotidien
-- =====================================================

CREATE OR REPLACE FUNCTION calculate_daily_challenge_points(problem_difficulty TEXT)
RETURNS INTEGER AS $$
BEGIN
  RETURN CASE problem_difficulty
    WHEN 'Easy' THEN 100
    WHEN 'Medium' THEN 200
    WHEN 'Hard' THEN 300
    ELSE 100
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =====================================================
-- 5. FONCTION: Mettre à jour le score journalier
-- =====================================================

CREATE OR REPLACE FUNCTION update_daily_challenge_score()
RETURNS TRIGGER AS $$
DECLARE
  v_problem_difficulty TEXT;
  v_points INTEGER;
  v_already_solved BOOLEAN;
  v_participant_exists BOOLEAN;
BEGIN
  -- Ne traiter que les soumissions acceptées
  IF NEW.status = 'accepted' THEN
    
    -- Vérifier si déjà résolu aujourd'hui
    SELECT EXISTS (
      SELECT 1 
      FROM daily_challenge_submissions 
      WHERE user_id = NEW.user_id 
        AND challenge_id = NEW.challenge_id
        AND problem_id = NEW.problem_id 
        AND status = 'accepted'
        AND id != NEW.id
        AND submitted_at < NEW.submitted_at
    ) INTO v_already_solved;
    
    -- Si déjà résolu, ne pas ajouter de points
    IF v_already_solved THEN
      RETURN NEW;
    END IF;
    
    -- Récupérer la difficulté du problème
    SELECT difficulty INTO v_problem_difficulty
    FROM problems
    WHERE id = NEW.problem_id;
    
    -- Calculer les points
    v_points := calculate_daily_challenge_points(v_problem_difficulty);
    
    -- Vérifier si le participant existe
    SELECT EXISTS (
      SELECT 1 
      FROM daily_challenge_participants
      WHERE challenge_id = NEW.challenge_id 
        AND user_id = NEW.user_id
    ) INTO v_participant_exists;
    
    -- Créer ou mettre à jour le participant
    IF NOT v_participant_exists THEN
      INSERT INTO daily_challenge_participants (challenge_id, user_id, daily_score, problems_solved, total_time)
      VALUES (NEW.challenge_id, NEW.user_id, v_points, 1, NEW.execution_time);
    ELSE
      UPDATE daily_challenge_participants
      SET 
        daily_score = daily_score + v_points,
        problems_solved = problems_solved + 1,
        total_time = total_time + NEW.execution_time
      WHERE challenge_id = NEW.challenge_id 
        AND user_id = NEW.user_id;
    END IF;
    
    -- Mettre à jour le total de participants dans le défi
    UPDATE daily_challenges
    SET total_participants = (
      SELECT COUNT(DISTINCT user_id)
      FROM daily_challenge_participants
      WHERE challenge_id = NEW.challenge_id
    )
    WHERE id = NEW.challenge_id;
    
    -- Recalculer les rangs pour ce défi
    PERFORM update_daily_challenge_ranks(NEW.challenge_id);
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 6. FONCTION: Recalculer les rangs du défi
-- =====================================================

CREATE OR REPLACE FUNCTION update_daily_challenge_ranks(p_challenge_id UUID)
RETURNS VOID AS $$
BEGIN
  WITH ranked_participants AS (
    SELECT 
      id,
      ROW_NUMBER() OVER (ORDER BY daily_score DESC, total_time ASC, joined_at ASC) AS new_rank
    FROM daily_challenge_participants
    WHERE challenge_id = p_challenge_id
  )
  UPDATE daily_challenge_participants dcp
  SET daily_rank = rp.new_rank
  FROM ranked_participants rp
  WHERE dcp.id = rp.id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 7. TRIGGER: Mise à jour automatique du score
-- =====================================================

DROP TRIGGER IF EXISTS trigger_update_daily_challenge_score ON daily_challenge_submissions;

CREATE TRIGGER trigger_update_daily_challenge_score
  AFTER INSERT OR UPDATE OF status ON daily_challenge_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_daily_challenge_score();

-- =====================================================
-- 8. FONCTION: Générer un défi quotidien
-- =====================================================

CREATE OR REPLACE FUNCTION generate_daily_challenge(p_date DATE DEFAULT CURRENT_DATE)
RETURNS UUID AS $$
DECLARE
  v_challenge_id UUID;
  v_problem_ids JSONB;
  v_easy_problems UUID[];
  v_medium_problems UUID[];
  v_hard_problems UUID[];
BEGIN
  -- Vérifier si un défi existe déjà pour cette date
  SELECT id INTO v_challenge_id
  FROM daily_challenges
  WHERE challenge_date = p_date;
  
  IF v_challenge_id IS NOT NULL THEN
    RETURN v_challenge_id;
  END IF;
  
  -- Sélectionner des problèmes aléatoires
  -- 1 Easy, 2 Medium, 1 Hard
  SELECT ARRAY_AGG(id) INTO v_easy_problems
  FROM (
    SELECT id FROM problems WHERE difficulty = 'Easy' ORDER BY RANDOM() LIMIT 1
  ) sub;
  
  SELECT ARRAY_AGG(id) INTO v_medium_problems
  FROM (
    SELECT id FROM problems WHERE difficulty = 'Medium' ORDER BY RANDOM() LIMIT 2
  ) sub;
  
  SELECT ARRAY_AGG(id) INTO v_hard_problems
  FROM (
    SELECT id FROM problems WHERE difficulty = 'Hard' ORDER BY RANDOM() LIMIT 1
  ) sub;
  
  -- Combiner les problèmes
  v_problem_ids := to_jsonb(ARRAY_CAT(ARRAY_CAT(
    COALESCE(v_easy_problems, ARRAY[]::UUID[]),
    COALESCE(v_medium_problems, ARRAY[]::UUID[])
  ), COALESCE(v_hard_problems, ARRAY[]::UUID[])));
  
  -- Créer le défi
  INSERT INTO daily_challenges (
    challenge_date,
    problem_ids,
    title,
    description,
    status
  ) VALUES (
    p_date,
    v_problem_ids,
    'Daily Challenge - ' || TO_CHAR(p_date, 'YYYY-MM-DD'),
    'Solve today''s problems to climb the daily leaderboard!',
    'active'
  ) RETURNING id INTO v_challenge_id;
  
  RETURN v_challenge_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 9. GÉNÉRER LE DÉFI D'AUJOURD'HUI
-- =====================================================

SELECT generate_daily_challenge(CURRENT_DATE);

-- =====================================================
-- 10. VÉRIFICATION
-- =====================================================

-- Afficher le défi du jour
SELECT 
  dc.id,
  dc.challenge_date,
  dc.title,
  dc.problem_ids,
  dc.total_participants,
  dc.status,
  (SELECT COUNT(*) FROM jsonb_array_elements(dc.problem_ids)) as problem_count
FROM daily_challenges dc
WHERE challenge_date = CURRENT_DATE;
