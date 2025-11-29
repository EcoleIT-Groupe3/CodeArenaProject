-- Insert sample problems (only if they don't exist)
INSERT INTO problems (title, slug, description, difficulty, category, points, acceptance_rate, total_submissions, solved_count)
SELECT * FROM (VALUES
  ('Two Sum', 'two-sum', 'Étant donné un tableau d''entiers nums et un entier target, retournez les indices des deux nombres tels que leur somme est égale à target.', 'Facile', 'Tableaux', 100, 49.2, 10234, 5032),
  ('Longest Substring', 'longest-substring', 'Trouvez la longueur de la plus longue sous-chaîne sans caractères répétés.', 'Moyen', 'Chaînes', 200, 33.8, 8456, 2859),
  ('Median of Two Arrays', 'median-two-arrays', 'Trouver la médiane de deux tableaux triés.', 'Difficile', 'Tableaux', 300, 34.5, 4521, 1560),
  ('Reverse Integer', 'reverse-integer', 'Inversez un entier de 32 bits signé.', 'Facile', 'Mathématiques', 100, 27.1, 9823, 2662),
  ('Valid Parentheses', 'valid-parentheses', 'Déterminez si une chaîne de parenthèses est valide.', 'Facile', 'Pile', 100, 40.6, 12456, 5057),
  ('Merge Intervals', 'merge-intervals', 'Fusionnez tous les intervalles qui se chevauchent.', 'Moyen', 'Tableaux', 200, 45.9, 6834, 3137),
  ('N-Queens Problem', 'n-queens', 'Placez N reines sur un échiquier NxN.', 'Difficile', 'Backtracking', 300, 62.3, 3245, 2022),
  ('Binary Tree Level Order', 'binary-tree-level', 'Parcours en largeur d''un arbre binaire.', 'Moyen', 'Arbres', 200, 61.2, 7654, 4684),
  ('Maximum Subarray', 'maximum-subarray', 'Trouvez le sous-tableau contigu avec la plus grande somme.', 'Moyen', 'Dynamique', 200, 50.1, 8923, 4470)
) AS tmp(title, slug, description, difficulty, category, points, acceptance_rate, total_submissions, solved_count)
WHERE NOT EXISTS (
  SELECT 1 FROM problems WHERE problems.slug = tmp.slug
);

-- Insert sample contests (only if they don't exist)
INSERT INTO contests (title, description, start_date, end_date, status, participants_count)
SELECT * FROM (VALUES
  ('CodeArena Championship 2025', 'Le plus grand concours de programmation de l''année avec des prix exceptionnels', '2025-01-15 14:00:00'::timestamp, '2025-01-15 17:00:00'::timestamp, 'upcoming', 2847),
  ('Weekly Challenge #47', 'Défi hebdomadaire avec 5 problèmes de difficulté croissante', '2024-12-28 10:00:00'::timestamp, '2024-12-28 12:00:00'::timestamp, 'active', 1523),
  ('Algorithmes Avancés', 'Concours spécialisé sur les algorithmes complexes', '2024-12-20 09:00:00'::timestamp, '2024-12-20 13:00:00'::timestamp, 'completed', 3421)
) AS tmp(title, description, start_date, end_date, status, participants_count)
WHERE NOT EXISTS (
  SELECT 1 FROM contests WHERE contests.title = tmp.title
);
