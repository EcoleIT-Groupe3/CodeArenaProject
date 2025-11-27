/*
  # Correction du Système de Scores et Statistiques

  ## Problème Identifié
  Après le redémarrage de la base de données, aucun trigger n'existe pour mettre à jour 
  automatiquement les scores des utilisateurs. Les soumissions sont enregistrées mais les 
  scores restent bloqués à 0.

  ## Solution Implémentée
  
  ### 1. Fonction de Calcul de Points
  Crée une fonction qui attribue des points selon la difficulté:
  - Easy: 10 points
  - Medium: 20 points  
  - Hard: 30 points
  
  ### 2. Trigger Automatique de Mise à Jour du Score
  Déclenche automatiquement la mise à jour du score utilisateur quand:
  - Une nouvelle soumission est créée avec status = 'accepted'
  - Une soumission existante passe à status = 'accepted'
  - Empêche le double comptage pour le même problème
  
  ### 3. Fonction de Recalcul du Rang
  Recalcule le rang de tous les utilisateurs basé sur leurs scores
  
  ### 4. Correction des Données Historiques
  Recalcule tous les scores pour les soumissions existantes
  
  ## Détails Techniques
  
  - Utilise des transactions pour garantir la cohérence
  - Évite le double comptage avec une vérification des problèmes déjà résolus
  - Met à jour les rangs en batch pour optimiser les performances
  - Gère les cas edge (premier problème résolu, changement de statut)
*/

-- =====================================================
-- 1. FONCTION: Calculer les points selon la difficulté
-- =====================================================

CREATE OR REPLACE FUNCTION calculate_problem_points(problem_difficulty TEXT)
RETURNS INTEGER AS $$
BEGIN
  RETURN CASE problem_difficulty
    WHEN 'Easy' THEN 10
    WHEN 'Medium' THEN 20
    WHEN 'Hard' THEN 30
    ELSE 10
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =====================================================
-- 2. FONCTION: Mettre à jour le score utilisateur
-- =====================================================

CREATE OR REPLACE FUNCTION update_user_score_on_submission()
RETURNS TRIGGER AS $$
DECLARE
  v_problem_difficulty TEXT;
  v_points INTEGER;
  v_already_solved BOOLEAN;
BEGIN
  -- Ne traiter que les soumissions acceptées
  IF NEW.status = 'accepted' THEN
    
    -- Vérifier si c'est un UPDATE (ancien status n'était pas accepted)
    -- ou un INSERT
    IF TG_OP = 'UPDATE' AND OLD.status = 'accepted' THEN
      -- Déjà compté, ne rien faire
      RETURN NEW;
    END IF;
    
    -- Vérifier si l'utilisateur a déjà résolu ce problème
    SELECT EXISTS (
      SELECT 1 
      FROM submissions 
      WHERE user_id = NEW.user_id 
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
    v_points := calculate_problem_points(v_problem_difficulty);
    
    -- Mettre à jour le score de l'utilisateur
    UPDATE users
    SET score = score + v_points
    WHERE id = NEW.user_id;
    
    -- Recalculer les rangs
    PERFORM update_all_user_ranks();
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 3. FONCTION: Recalculer tous les rangs
-- =====================================================

CREATE OR REPLACE FUNCTION update_all_user_ranks()
RETURNS VOID AS $$
BEGIN
  -- Mettre à jour tous les rangs en une seule requête
  WITH ranked_users AS (
    SELECT 
      id,
      ROW_NUMBER() OVER (ORDER BY score DESC, created_at ASC) AS new_rank
    FROM users
  )
  UPDATE users u
  SET rank = ru.new_rank
  FROM ranked_users ru
  WHERE u.id = ru.id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 4. CRÉER LE TRIGGER
-- =====================================================

-- Supprimer le trigger s'il existe
DROP TRIGGER IF EXISTS trigger_update_user_score ON submissions;

-- Créer le trigger pour les INSERT et UPDATE
CREATE TRIGGER trigger_update_user_score
  AFTER INSERT OR UPDATE OF status ON submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_user_score_on_submission();

-- =====================================================
-- 5. CORRECTION DES DONNÉES HISTORIQUES
-- =====================================================

-- Réinitialiser tous les scores
UPDATE users SET score = 0, rank = 0;

-- Recalculer les scores pour toutes les soumissions acceptées
DO $$
DECLARE
  v_submission RECORD;
  v_problem_difficulty TEXT;
  v_points INTEGER;
  v_already_counted BOOLEAN;
BEGIN
  -- Parcourir toutes les soumissions acceptées par ordre chronologique
  FOR v_submission IN 
    SELECT DISTINCT ON (user_id, problem_id)
      id, user_id, problem_id, status, submitted_at
    FROM submissions
    WHERE status = 'accepted'
    ORDER BY user_id, problem_id, submitted_at ASC
  LOOP
    -- Récupérer la difficulté du problème
    SELECT difficulty INTO v_problem_difficulty
    FROM problems
    WHERE id = v_submission.problem_id;
    
    -- Calculer les points
    v_points := calculate_problem_points(v_problem_difficulty);
    
    -- Ajouter les points à l'utilisateur
    UPDATE users
    SET score = score + v_points
    WHERE id = v_submission.user_id;
    
  END LOOP;
  
  -- Recalculer tous les rangs
  PERFORM update_all_user_ranks();
  
END $$;

-- =====================================================
-- 6. VÉRIFICATION
-- =====================================================

-- Afficher les scores mis à jour
SELECT 
  u.username,
  u.email,
  u.score,
  u.rank,
  COUNT(DISTINCT CASE WHEN s.status = 'accepted' THEN s.problem_id END) as problems_solved,
  COUNT(s.id) as total_submissions,
  COUNT(CASE WHEN s.status = 'accepted' THEN 1 END) as accepted_submissions
FROM users u
LEFT JOIN submissions s ON u.id = s.user_id
GROUP BY u.id, u.username, u.email, u.score, u.rank
ORDER BY u.score DESC, u.rank ASC;
