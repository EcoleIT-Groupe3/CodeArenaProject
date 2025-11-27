/*
  # Fix Security and Performance Issues

  1. Index Manquants
     - Ajout d'index sur contests.created_by

  2. Optimisation RLS
     - Toutes les politiques utilisent maintenant (SELECT auth.uid())
     - Performance améliorée à grande échelle

  3. Documentation des index existants
*/

-- Index pour clé étrangère manquante
CREATE INDEX IF NOT EXISTS idx_contests_created_by ON contests(created_by);

-- Optimisation RLS - users
DROP POLICY IF EXISTS "Users can update own profile" ON users;
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id);

-- Optimisation RLS - contests
DROP POLICY IF EXISTS "Users can create contests" ON contests;
CREATE POLICY "Users can create contests"
  ON contests FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = created_by);

-- Optimisation RLS - contest_participants
DROP POLICY IF EXISTS "Users can join contests" ON contest_participants;
CREATE POLICY "Users can join contests"
  ON contest_participants FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update their participation" ON contest_participants;
CREATE POLICY "Users can update their participation"
  ON contest_participants FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- Optimisation RLS - submissions
DROP POLICY IF EXISTS "Users can create submissions" ON submissions;
CREATE POLICY "Users can create submissions"
  ON submissions FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);