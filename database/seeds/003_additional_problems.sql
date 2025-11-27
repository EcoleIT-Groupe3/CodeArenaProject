/*
  # Problèmes Additionnels - 5 nouveaux challenges

  Ce script ajoute 5 nouveaux problèmes de programmation variés:
  1. Palindrome Check (Easy) - Vérification de palindrome
  2. Find Maximum in Array (Easy) - Trouver le maximum
  3. Valid Parentheses (Medium) - Parenthèses équilibrées
  4. Merge Two Sorted Arrays (Medium) - Fusion de tableaux triés
  5. Longest Common Prefix (Medium) - Plus long préfixe commun
*/

-- =====================================================
-- PROBLÈME 1: Palindrome Check (Easy)
-- =====================================================

INSERT INTO problems (title, description, difficulty, test_cases, time_limit, memory_limit)
VALUES (
  'Palindrome Check',
  'A string is a palindrome if it reads the same forward and backward. Write a function to check if a given string is a palindrome.

Example 1:
Input: "racecar"
Output: true
Explanation: "racecar" spelled backwards is "racecar"

Example 2:
Input: "hello"
Output: false
Explanation: "hello" spelled backwards is "olleh"

Note: Ignore case and special characters.

Constraints:
- 1 <= string.length <= 1000
- String contains only letters and spaces',
  'Easy',
  '[
    {"input": "racecar", "output": "true"},
    {"input": "hello", "output": "false"},
    {"input": "A man a plan a canal Panama", "output": "true"},
    {"input": "Was it a car or a cat I saw", "output": "true"}
  ]'::jsonb,
  3000,
  256
)
ON CONFLICT DO NOTHING;

-- =====================================================
-- PROBLÈME 2: Find Maximum in Array (Easy)
-- =====================================================

INSERT INTO problems (title, description, difficulty, test_cases, time_limit, memory_limit)
VALUES (
  'Find Maximum in Array',
  'Given an array of integers, return the maximum element.

Example 1:
Input: [3, 7, 2, 9, 1]
Output: 9

Example 2:
Input: [-5, -2, -8, -1]
Output: -1

Example 3:
Input: [42]
Output: 42

Constraints:
- 1 <= array.length <= 10^4
- -10^9 <= array[i] <= 10^9',
  'Easy',
  '[
    {"input": "[3, 7, 2, 9, 1]", "output": "9"},
    {"input": "[-5, -2, -8, -1]", "output": "-1"},
    {"input": "[42]", "output": "42"},
    {"input": "[100, 200, 50, 175, 225]", "output": "225"}
  ]'::jsonb,
  4000,
  256
)
ON CONFLICT DO NOTHING;

-- =====================================================
-- PROBLÈME 3: Valid Parentheses (Medium)
-- =====================================================

INSERT INTO problems (title, description, difficulty, test_cases, time_limit, memory_limit)
VALUES (
  'Valid Parentheses',
  'Given a string containing just the characters ''('', '')'', ''{'', ''}'', ''['' and '']'', determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets
2. Open brackets must be closed in the correct order

Example 1:
Input: "()"
Output: true

Example 2:
Input: "()[]{}"
Output: true

Example 3:
Input: "(]"
Output: false

Example 4:
Input: "([)]"
Output: false

Constraints:
- 1 <= string.length <= 10^4',
  'Medium',
  '[
    {"input": "()", "output": "true"},
    {"input": "()[]{}", "output": "true"},
    {"input": "(]", "output": "false"},
    {"input": "([)]", "output": "false"},
    {"input": "{[]}", "output": "true"}
  ]'::jsonb,
  5000,
  256
)
ON CONFLICT DO NOTHING;

-- =====================================================
-- PROBLÈME 4: Merge Two Sorted Arrays (Medium)
-- =====================================================

INSERT INTO problems (title, description, difficulty, test_cases, time_limit, memory_limit)
VALUES (
  'Merge Two Sorted Arrays',
  'Given two sorted arrays, merge them into one sorted array.

Example 1:
Input: arr1 = [1, 3, 5], arr2 = [2, 4, 6]
Output: [1, 2, 3, 4, 5, 6]

Example 2:
Input: arr1 = [1, 2, 3], arr2 = [4, 5, 6]
Output: [1, 2, 3, 4, 5, 6]

Example 3:
Input: arr1 = [], arr2 = [1, 2]
Output: [1, 2]

Constraints:
- 0 <= arr1.length, arr2.length <= 1000
- -10^9 <= arr1[i], arr2[i] <= 10^9
- Both arrays are sorted in ascending order',
  'Medium',
  '[
    {"input": "[1, 3, 5], [2, 4, 6]", "output": "[1, 2, 3, 4, 5, 6]"},
    {"input": "[1, 2, 3], [4, 5, 6]", "output": "[1, 2, 3, 4, 5, 6]"},
    {"input": "[], [1, 2]", "output": "[1, 2]"},
    {"input": "[1], [2, 3, 4]", "output": "[1, 2, 3, 4]"}
  ]'::jsonb,
  5000,
  256
)
ON CONFLICT DO NOTHING;

-- =====================================================
-- PROBLÈME 5: Longest Common Prefix (Medium)
-- =====================================================

INSERT INTO problems (title, description, difficulty, test_cases, time_limit, memory_limit)
VALUES (
  'Longest Common Prefix',
  'Write a function to find the longest common prefix string amongst an array of strings. If there is no common prefix, return an empty string.

Example 1:
Input: ["flower", "flow", "flight"]
Output: "fl"

Example 2:
Input: ["dog", "racecar", "car"]
Output: ""
Explanation: There is no common prefix among the input strings.

Example 3:
Input: ["interspecies", "interstellar", "interstate"]
Output: "inters"

Constraints:
- 1 <= strings.length <= 200
- 0 <= strings[i].length <= 200
- strings[i] consists of only lowercase English letters',
  'Medium',
  '[
    {"input": "[\"flower\", \"flow\", \"flight\"]", "output": "\"fl\""},
    {"input": "[\"dog\", \"racecar\", \"car\"]", "output": "\"\""},
    {"input": "[\"interspecies\", \"interstellar\", \"interstate\"]", "output": "\"inters\""},
    {"input": "[\"apple\", \"apple\", \"apple\"]", "output": "\"apple\""}
  ]'::jsonb,
  5000,
  256
)
ON CONFLICT DO NOTHING;

-- =====================================================
-- Vérification
-- =====================================================

-- Afficher tous les problèmes
SELECT
  title,
  difficulty,
  jsonb_array_length(test_cases) as test_count,
  time_limit,
  memory_limit
FROM problems
ORDER BY
  CASE difficulty
    WHEN 'Easy' THEN 1
    WHEN 'Medium' THEN 2
    WHEN 'Hard' THEN 3
  END,
  title;
