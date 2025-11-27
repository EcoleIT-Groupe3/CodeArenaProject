/*
  # Données de test - Problèmes exemple

  Ce script insère des problèmes de programmation d'exemple pour tester la plateforme.

  Problèmes inclus:
  1. Two Sum (Easy) - Manipulation de tableaux
  2. Reverse String (Easy) - Opérations sur chaînes
  3. Fibonacci Number (Medium) - Programmation dynamique
*/

-- Suppression des données existantes (optionnel)
-- TRUNCATE TABLE problems CASCADE;

-- =====================================================
-- PROBLÈME 1: Two Sum
-- =====================================================

INSERT INTO problems (title, description, difficulty, test_cases, time_limit)
VALUES (
  'Two Sum',
  'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution.

Example:
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].

Constraints:
- 2 <= nums.length <= 10^4
- -10^9 <= nums[i] <= 10^9
- -10^9 <= target <= 10^9
- Only one valid answer exists.',
  'Easy',
  '[
    {"input": "[2,7,11,15], 9", "output": "[0,1]"},
    {"input": "[3,2,4], 6", "output": "[1,2]"},
    {"input": "[3,3], 6", "output": "[0,1]"}
  ]'::jsonb,
  5000
)
ON CONFLICT DO NOTHING;

-- =====================================================
-- PROBLÈME 2: Reverse String
-- =====================================================

INSERT INTO problems (title, description, difficulty, test_cases, time_limit)
VALUES (
  'Reverse String',
  'Write a function that reverses a string. The input string is given as an array of characters.

Example:
Input: "hello"
Output: "olleh"

Example 2:
Input: "CodeArena"
Output: "anerAedoC"

Constraints:
- 1 <= s.length <= 10^5
- s contains only printable ASCII characters.',
  'Easy',
  '[
    {"input": "hello", "output": "olleh"},
    {"input": "world", "output": "dlrow"},
    {"input": "CodeArena", "output": "anerAedoC"}
  ]'::jsonb,
  3000
)
ON CONFLICT DO NOTHING;

-- =====================================================
-- PROBLÈME 3: Fibonacci Number
-- =====================================================

INSERT INTO problems (title, description, difficulty, test_cases, time_limit)
VALUES (
  'Fibonacci Number',
  'The Fibonacci numbers, commonly denoted F(n) form a sequence, called the Fibonacci sequence, such that each number is the sum of the two preceding ones, starting from 0 and 1.

That is:
F(0) = 0, F(1) = 1
F(n) = F(n - 1) + F(n - 2), for n > 1.

Given n, calculate F(n).

Example 1:
Input: n = 5
Output: 5
Explanation: F(5) = F(4) + F(3) = 3 + 2 = 5.

Example 2:
Input: n = 10
Output: 55

Constraints:
- 0 <= n <= 30',
  'Medium',
  '[
    {"input": "5", "output": "5"},
    {"input": "10", "output": "55"},
    {"input": "15", "output": "610"}
  ]'::jsonb,
  5000
)
ON CONFLICT DO NOTHING;

-- =====================================================
-- Vérification
-- =====================================================

-- Afficher les problèmes insérés
SELECT id, title, difficulty, array_length(test_cases::json::text::json, 1) as test_case_count
FROM problems
ORDER BY created_at;
