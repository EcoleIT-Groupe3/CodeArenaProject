/*
  # Données de test - Concours exemple

  Ce script insère des concours d'exemple.

  Note: Remplacez les UUIDs des problèmes par ceux de votre base de données.
*/

-- =====================================================
-- CONCOURS 1: Weekly Challenge
-- =====================================================

INSERT INTO contests (
  title,
  description,
  start_time,
  end_time,
  status,
  problem_ids
)
VALUES (
  'Weekly Code Challenge #1',
  'Notre premier concours hebdomadaire ! Résolvez 3 problèmes en 2 heures.',
  NOW() + INTERVAL '1 day',
  NOW() + INTERVAL '1 day' + INTERVAL '2 hours',
  'upcoming',
  '[]'::jsonb
)
ON CONFLICT DO NOTHING;

-- =====================================================
-- CONCOURS 2: Beginner Contest
-- =====================================================

INSERT INTO contests (
  title,
  description,
  start_time,
  end_time,
  status,
  problem_ids
)
VALUES (
  'Beginner Contest - Easy Problems',
  'Parfait pour les débutants ! Problèmes faciles pour commencer.',
  NOW() + INTERVAL '3 days',
  NOW() + INTERVAL '3 days' + INTERVAL '1 hour',
  'upcoming',
  '[]'::jsonb
)
ON CONFLICT DO NOTHING;

-- =====================================================
-- CONCOURS 3: Advanced Challenge
-- =====================================================

INSERT INTO contests (
  title,
  description,
  start_time,
  end_time,
  status,
  problem_ids
)
VALUES (
  'Advanced Algorithm Challenge',
  'Pour les développeurs expérimentés. Problèmes complexes !',
  NOW() + INTERVAL '7 days',
  NOW() + INTERVAL '7 days' + INTERVAL '3 hours',
  'upcoming',
  '[]'::jsonb
)
ON CONFLICT DO NOTHING;

-- =====================================================
-- Vérification
-- =====================================================

SELECT id, title, status, start_time, end_time
FROM contests
ORDER BY start_time;
