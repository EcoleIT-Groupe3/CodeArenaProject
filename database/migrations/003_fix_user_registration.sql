/*
  # Fix User Registration - Migration 003

  ## Problème Résolu
  Les utilisateurs ne pouvaient pas s'inscrire car il manquait une politique RLS
  permettant l'insertion dans la table `users`.

  ## Solution
  Ajout d'une politique RLS permettant aux utilisateurs authentifiés d'insérer
  leur propre profil lors de l'inscription.

  ## Changements
  1. Nouvelle politique INSERT sur la table users
     - Permet aux nouveaux utilisateurs de créer leur profil
     - Vérifie que l'ID correspond à l'utilisateur authentifié
     - Utilise (SELECT auth.uid()) pour optimisation performance
*/

-- =====================================================
-- POLITIQUE RLS POUR INSCRIPTION
-- =====================================================

-- Supprimer si existe déjà
DROP POLICY IF EXISTS "Users can insert own profile during signup" ON users;

-- Créer la politique d'insertion
CREATE POLICY "Users can insert own profile during signup"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = id);

COMMENT ON POLICY "Users can insert own profile during signup" ON users
IS 'Permet aux nouveaux utilisateurs de créer leur profil lors de l''inscription';

-- =====================================================
-- VÉRIFICATION
-- =====================================================

-- Lister toutes les politiques sur la table users
SELECT
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'users'
ORDER BY policyname;

-- Résultat attendu: 3 politiques
-- 1. Users can insert own profile during signup (INSERT)
-- 2. Users can read all user profiles (SELECT)
-- 3. Users can update own profile (UPDATE)
