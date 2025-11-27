/*
  # Requêtes SQL Utiles pour CodeArena

  Collection de requêtes SQL couramment utilisées pour gérer et interroger la base de données.
*/

-- =====================================================
-- STATISTIQUES GÉNÉRALES
-- =====================================================

-- Nombre total d'utilisateurs
SELECT COUNT(*) as total_users FROM users;

-- Nombre total de problèmes par difficulté
SELECT
  difficulty,
  COUNT(*) as count
FROM problems
GROUP BY difficulty
ORDER BY
  CASE difficulty
    WHEN 'Easy' THEN 1
    WHEN 'Medium' THEN 2
    WHEN 'Hard' THEN 3
  END;

-- Nombre total de soumissions
SELECT COUNT(*) as total_submissions FROM submissions;

-- Taux de réussite global
SELECT
  ROUND(
    COUNT(*) FILTER (WHERE status = 'accepted')::numeric /
    NULLIF(COUNT(*), 0) * 100,
    2
  ) as success_rate_percent
FROM submissions;

-- =====================================================
-- CLASSEMENTS ET LEADERBOARDS
-- =====================================================

-- Top 10 utilisateurs par score
SELECT
  rank,
  username,
  score,
  email,
  created_at
FROM users
ORDER BY score DESC, created_at ASC
LIMIT 10;

-- Top utilisateurs avec statistiques détaillées
SELECT
  u.username,
  u.score,
  COUNT(s.id) as total_submissions,
  COUNT(s.id) FILTER (WHERE s.status = 'accepted') as successful_submissions,
  ROUND(
    COUNT(s.id) FILTER (WHERE s.status = 'accepted')::numeric /
    NULLIF(COUNT(s.id), 0) * 100,
    2
  ) as success_rate
FROM users u
LEFT JOIN submissions s ON u.id = s.user_id
GROUP BY u.id, u.username, u.score
ORDER BY u.score DESC
LIMIT 20;

-- =====================================================
-- PROBLÈMES
-- =====================================================

-- Liste tous les problèmes avec statistiques
SELECT
  p.id,
  p.title,
  p.difficulty,
  p.time_limit,
  jsonb_array_length(p.test_cases) as test_case_count,
  COUNT(s.id) as submission_count,
  COUNT(s.id) FILTER (WHERE s.status = 'accepted') as solved_count
FROM problems p
LEFT JOIN submissions s ON p.id = s.problem_id
GROUP BY p.id
ORDER BY p.created_at DESC;

-- Problèmes les plus difficiles (moins résolus)
SELECT
  p.title,
  p.difficulty,
  COUNT(s.id) as total_attempts,
  COUNT(s.id) FILTER (WHERE s.status = 'accepted') as successful_solves,
  ROUND(
    COUNT(s.id) FILTER (WHERE s.status = 'accepted')::numeric /
    NULLIF(COUNT(s.id), 0) * 100,
    2
  ) as solve_rate
FROM problems p
LEFT JOIN submissions s ON p.id = s.problem_id
GROUP BY p.id, p.title, p.difficulty
HAVING COUNT(s.id) > 0
ORDER BY solve_rate ASC
LIMIT 10;

-- Problèmes non encore résolus
SELECT
  p.title,
  p.difficulty,
  COUNT(s.id) as attempt_count
FROM problems p
LEFT JOIN submissions s ON p.id = s.problem_id AND s.status = 'accepted'
WHERE s.id IS NULL
GROUP BY p.id, p.title, p.difficulty;

-- =====================================================
-- SOUMISSIONS
-- =====================================================

-- Dernières soumissions avec détails utilisateur
SELECT
  u.username,
  p.title as problem,
  s.language,
  s.status,
  s.score,
  s.execution_time,
  s.submitted_at
FROM submissions s
JOIN users u ON s.user_id = u.id
JOIN problems p ON s.problem_id = p.id
ORDER BY s.submitted_at DESC
LIMIT 50;

-- Soumissions d'un utilisateur spécifique
-- Remplacer 'username_here' par le nom d'utilisateur
SELECT
  p.title,
  s.language,
  s.status,
  s.score,
  s.execution_time,
  s.submitted_at
FROM submissions s
JOIN problems p ON s.problem_id = p.id
JOIN users u ON s.user_id = u.id
WHERE u.username = 'username_here'
ORDER BY s.submitted_at DESC;

-- Distribution des statuts de soumission
SELECT
  status,
  COUNT(*) as count,
  ROUND(COUNT(*)::numeric / SUM(COUNT(*)) OVER () * 100, 2) as percentage
FROM submissions
GROUP BY status
ORDER BY count DESC;

-- Langages les plus utilisés
SELECT
  language,
  COUNT(*) as usage_count,
  ROUND(COUNT(*)::numeric / SUM(COUNT(*)) OVER () * 100, 2) as percentage
FROM submissions
GROUP BY language
ORDER BY usage_count DESC;

-- Temps d'exécution moyen par langage
SELECT
  language,
  ROUND(AVG(execution_time)::numeric, 2) as avg_execution_time_ms,
  MIN(execution_time) as min_time,
  MAX(execution_time) as max_time
FROM submissions
WHERE status = 'accepted'
GROUP BY language
ORDER BY avg_execution_time_ms ASC;

-- =====================================================
-- CONCOURS
-- =====================================================

-- Liste des concours avec nombre de participants
SELECT
  c.id,
  c.title,
  c.status,
  c.start_time,
  c.end_time,
  COUNT(DISTINCT cp.user_id) as participant_count,
  jsonb_array_length(c.problem_ids) as problem_count
FROM contests c
LEFT JOIN contest_participants cp ON c.id = cp.contest_id
GROUP BY c.id
ORDER BY c.start_time DESC;

-- Concours actifs
SELECT
  title,
  description,
  start_time,
  end_time
FROM contests
WHERE status = 'active'
  AND start_time <= NOW()
  AND end_time >= NOW()
ORDER BY start_time;

-- Classement d'un concours spécifique
-- Remplacer 'contest_id_here' par l'ID du concours
SELECT
  cp.rank,
  u.username,
  cp.score,
  cp.joined_at
FROM contest_participants cp
JOIN users u ON cp.user_id = u.id
WHERE cp.contest_id = 'contest_id_here'
ORDER BY cp.rank ASC;

-- =====================================================
-- ANALYSES TEMPORELLES
-- =====================================================

-- Soumissions par jour (7 derniers jours)
SELECT
  DATE(submitted_at) as date,
  COUNT(*) as submission_count,
  COUNT(*) FILTER (WHERE status = 'accepted') as accepted_count
FROM submissions
WHERE submitted_at >= NOW() - INTERVAL '7 days'
GROUP BY DATE(submitted_at)
ORDER BY date DESC;

-- Nouveaux utilisateurs par jour (30 derniers jours)
SELECT
  DATE(created_at) as date,
  COUNT(*) as new_users
FROM users
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Activité par heure de la journée
SELECT
  EXTRACT(HOUR FROM submitted_at) as hour,
  COUNT(*) as submission_count
FROM submissions
WHERE submitted_at >= NOW() - INTERVAL '7 days'
GROUP BY EXTRACT(HOUR FROM submitted_at)
ORDER BY hour;

-- =====================================================
-- RECHERCHE ET FILTRAGE
-- =====================================================

-- Rechercher des problèmes par titre
-- Remplacer 'search_term' par le terme recherché
SELECT
  id,
  title,
  difficulty,
  description
FROM problems
WHERE
  title ILIKE '%search_term%'
  OR description ILIKE '%search_term%'
ORDER BY difficulty, title;

-- Trouver les utilisateurs inactifs (pas de soumission depuis 30 jours)
SELECT
  u.username,
  u.email,
  u.score,
  MAX(s.submitted_at) as last_submission
FROM users u
LEFT JOIN submissions s ON u.id = s.user_id
GROUP BY u.id, u.username, u.email, u.score
HAVING
  MAX(s.submitted_at) IS NULL
  OR MAX(s.submitted_at) < NOW() - INTERVAL '30 days'
ORDER BY last_submission DESC NULLS LAST;

-- =====================================================
-- MAINTENANCE
-- =====================================================

-- Recalculer les rangs des utilisateurs
WITH ranked_users AS (
  SELECT
    id,
    ROW_NUMBER() OVER (ORDER BY score DESC, created_at ASC) as new_rank
  FROM users
)
UPDATE users
SET rank = ranked_users.new_rank
FROM ranked_users
WHERE users.id = ranked_users.id;

-- Supprimer les soumissions de plus de 1 an
DELETE FROM submissions
WHERE submitted_at < NOW() - INTERVAL '1 year';

-- Mettre à jour le statut des concours
UPDATE contests
SET status = 'active'
WHERE status = 'upcoming'
  AND start_time <= NOW()
  AND end_time >= NOW();

UPDATE contests
SET status = 'completed'
WHERE status = 'active'
  AND end_time < NOW();

-- =====================================================
-- VÉRIFICATIONS D'INTÉGRITÉ
-- =====================================================

-- Vérifier les contraintes de clés étrangères
SELECT
  conname as constraint_name,
  conrelid::regclass as table_name,
  confrelid::regclass as referenced_table
FROM pg_constraint
WHERE contype = 'f'
  AND connamespace = 'public'::regnamespace;

-- Vérifier les index
SELECT
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- Vérifier les politiques RLS
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Taille des tables
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- =====================================================
-- RAPPORTS
-- =====================================================

-- Rapport d'activité hebdomadaire
SELECT
  'Total Users' as metric,
  COUNT(*)::text as value
FROM users
UNION ALL
SELECT
  'New Users (7 days)',
  COUNT(*)::text
FROM users
WHERE created_at >= NOW() - INTERVAL '7 days'
UNION ALL
SELECT
  'Total Submissions (7 days)',
  COUNT(*)::text
FROM submissions
WHERE submitted_at >= NOW() - INTERVAL '7 days'
UNION ALL
SELECT
  'Active Users (7 days)',
  COUNT(DISTINCT user_id)::text
FROM submissions
WHERE submitted_at >= NOW() - INTERVAL '7 days'
UNION ALL
SELECT
  'Success Rate (7 days)',
  ROUND(
    COUNT(*) FILTER (WHERE status = 'accepted')::numeric /
    NULLIF(COUNT(*), 0) * 100,
    2
  )::text || '%'
FROM submissions
WHERE submitted_at >= NOW() - INTERVAL '7 days';
