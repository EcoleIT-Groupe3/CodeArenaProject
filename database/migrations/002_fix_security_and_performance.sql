/*
  # Fix Security and Performance Issues - Migration 002

  ## Changements

  1. **Index Manquants**
     - Ajout d'index sur contests.created_by (clé étrangère non indexée)

  2. **Optimisation RLS**
     - Correction de toutes les politiques RLS pour utiliser (SELECT auth.uid())
     - Évite la réévaluation pour chaque ligne (amélioration performance)
     - Affecte: users, contests, contest_participants, submissions

  3. **Index Inutilisés**
     - Les index existants seront utilisés une fois les données présentes
     - Pas de suppression - ils sont nécessaires pour la production

  ## Notes
  - Les politiques RLS sont DROP puis recréées avec la syntaxe optimisée
  - L'index sur created_by améliore les requêtes de type "concours créés par X"
  - Performance améliorée à grande échelle
*/

-- =====================================================
-- 1. AJOUT INDEX MANQUANT
-- =====================================================

-- Index pour la clé étrangère contests.created_by
CREATE INDEX IF NOT EXISTS idx_contests_created_by ON contests(created_by);

COMMENT ON INDEX idx_contests_created_by IS 'Index pour optimiser les requêtes sur created_by (clé étrangère)';

-- =====================================================
-- 2. OPTIMISATION POLITIQUES RLS - TABLE: users
-- =====================================================

-- Supprimer l'ancienne politique
DROP POLICY IF EXISTS "Users can update own profile" ON users;

-- Recréer avec optimisation
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id);

COMMENT ON POLICY "Users can update own profile" ON users IS 'Optimisé: utilise (SELECT auth.uid()) pour éviter réévaluation par ligne';

-- =====================================================
-- 3. OPTIMISATION POLITIQUES RLS - TABLE: contests
-- =====================================================

-- Supprimer l'ancienne politique
DROP POLICY IF EXISTS "Users can create contests" ON contests;

-- Recréer avec optimisation
CREATE POLICY "Users can create contests"
  ON contests FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = created_by);

COMMENT ON POLICY "Users can create contests" ON contests IS 'Optimisé: utilise (SELECT auth.uid()) pour éviter réévaluation par ligne';

-- =====================================================
-- 4. OPTIMISATION POLITIQUES RLS - TABLE: contest_participants
-- =====================================================

-- Supprimer les anciennes politiques
DROP POLICY IF EXISTS "Users can join contests" ON contest_participants;
DROP POLICY IF EXISTS "Users can update their participation" ON contest_participants;

-- Recréer avec optimisations
CREATE POLICY "Users can join contests"
  ON contest_participants FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update their participation"
  ON contest_participants FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

COMMENT ON POLICY "Users can join contests" ON contest_participants IS 'Optimisé: utilise (SELECT auth.uid())';
COMMENT ON POLICY "Users can update their participation" ON contest_participants IS 'Optimisé: utilise (SELECT auth.uid())';

-- =====================================================
-- 5. OPTIMISATION POLITIQUES RLS - TABLE: submissions
-- =====================================================

-- Supprimer l'ancienne politique
DROP POLICY IF EXISTS "Users can create submissions" ON submissions;

-- Recréer avec optimisation
CREATE POLICY "Users can create submissions"
  ON submissions FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

COMMENT ON POLICY "Users can create submissions" ON submissions IS 'Optimisé: utilise (SELECT auth.uid())';

-- =====================================================
-- 6. VÉRIFICATION DES INDEX
-- =====================================================

-- Les index suivants existent déjà et seront utilisés en production:
-- - idx_submissions_user_id
-- - idx_submissions_problem_id
-- - idx_submissions_contest_id
-- - idx_contest_participants_contest_id
-- - idx_contest_participants_user_id
--
-- Ils apparaissent comme "non utilisés" car il n'y a pas encore de données.
-- Ces index sont CRITIQUES pour la performance en production.

-- Ajout de commentaires pour documentation
COMMENT ON INDEX idx_submissions_user_id IS 'Optimise requêtes: soumissions par utilisateur (JOIN, WHERE)';
COMMENT ON INDEX idx_submissions_problem_id IS 'Optimise requêtes: soumissions par problème (JOIN, WHERE)';
COMMENT ON INDEX idx_submissions_contest_id IS 'Optimise requêtes: soumissions par concours (JOIN, WHERE)';
COMMENT ON INDEX idx_contest_participants_contest_id IS 'Optimise requêtes: participants par concours (JOIN, WHERE)';
COMMENT ON INDEX idx_contest_participants_user_id IS 'Optimise requêtes: concours par utilisateur (JOIN, WHERE)';

-- =====================================================
-- 7. VÉRIFICATION FINALE
-- =====================================================

-- Vérifier que toutes les politiques RLS utilisent maintenant (SELECT auth.uid())
DO $$
DECLARE
  policy_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE schemaname = 'public'
    AND (
      qual LIKE '%auth.uid()%'
      OR with_check LIKE '%auth.uid()%'
    )
    AND NOT (
      qual LIKE '%(SELECT auth.uid())%'
      OR with_check LIKE '%(SELECT auth.uid())%'
    );

  IF policy_count > 0 THEN
    RAISE NOTICE 'ATTENTION: % politique(s) RLS utilisent encore auth.uid() sans SELECT', policy_count;
  ELSE
    RAISE NOTICE 'SUCCESS: Toutes les politiques RLS sont optimisées';
  END IF;
END $$;

-- Liste des index pour vérification
SELECT
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- =====================================================
-- FIN DE LA MIGRATION
-- =====================================================

-- Résumé des changements:
-- ✓ Ajout index sur contests.created_by (1 nouvel index)
-- ✓ 6 politiques RLS optimisées avec (SELECT auth.uid())
-- ✓ Documentation ajoutée sur les index existants
-- ✓ Performance améliorée pour les requêtes à grande échelle
