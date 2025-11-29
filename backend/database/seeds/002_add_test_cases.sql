-- Update problems with test cases

-- Sum of Two Numbers problem
UPDATE problems
SET test_cases = '[
  {"input": "5 3", "output": "8"},
  {"input": "10 20", "output": "30"},
  {"input": "-5 5", "output": "0"},
  {"input": "0 0", "output": "0"}
]'::jsonb
WHERE slug = 'somme-de-deux-nombres';

-- Reverse a String problem
UPDATE problems
SET test_cases = '[
  {"input": "hello", "output": "olleh"},
  {"input": "world", "output": "dlrow"},
  {"input": "a", "output": "a"},
  {"input": "CodeArena", "output": "anerAedoC"}
]'::jsonb
WHERE slug = 'inverser-une-chaine';

-- Palindrome Check problem
UPDATE problems
SET test_cases = '[
  {"input": "radar", "output": "true"},
  {"input": "hello", "output": "false"},
  {"input": "A man a plan a canal Panama", "output": "true"},
  {"input": "racecar", "output": "true"}
]'::jsonb
WHERE slug = 'verifier-palindrome';

-- Fibonacci Number problem
UPDATE problems
SET test_cases = '[
  {"input": "0", "output": "0"},
  {"input": "1", "output": "1"},
  {"input": "5", "output": "5"},
  {"input": "10", "output": "55"}
]'::jsonb
WHERE slug = 'nombre-fibonacci';

-- Array Maximum problem
UPDATE problems
SET test_cases = '[
  {"input": "1 5 3 9 2", "output": "9"},
  {"input": "-1 -5 -3", "output": "-1"},
  {"input": "42", "output": "42"},
  {"input": "100 200 150 250", "output": "250"}
]'::jsonb
WHERE slug = 'maximum-tableau';

-- Binary Search problem
UPDATE problems
SET test_cases = '[
  {"input": "1 2 3 4 5\\n3", "output": "2"},
  {"input": "10 20 30 40 50\\n25", "output": "-1"},
  {"input": "5\\n5", "output": "0"},
  {"input": "1 3 5 7 9\\n1", "output": "0"}
]'::jsonb
WHERE slug = 'recherche-binaire';

-- Sorting Algorithm problem
UPDATE problems
SET test_cases = '[
  {"input": "5 2 8 1 9", "output": "1 2 5 8 9"},
  {"input": "3 3 3", "output": "3 3 3"},
  {"input": "10 5 2 8", "output": "2 5 8 10"},
  {"input": "-5 0 3 -2", "output": "-5 -2 0 3"}
]'::jsonb
WHERE slug = 'algorithme-tri';

-- Valid Parentheses problem
UPDATE problems
SET test_cases = '[
  {"input": "()", "output": "true"},
  {"input": "()[]{}", "output": "true"},
  {"input": "(]", "output": "false"},
  {"input": "({[]})", "output": "true"}
]'::jsonb
WHERE slug = 'parentheses-valides';

-- Longest Substring problem
UPDATE problems
SET test_cases = '[
  {"input": "abcabcbb", "output": "3"},
  {"input": "bbbbb", "output": "1"},
  {"input": "pwwkew", "output": "3"},
  {"input": "abcdef", "output": "6"}
]'::jsonb
WHERE slug = 'plus-longue-sous-chaine';

-- Graph Traversal problem
UPDATE problems
SET test_cases = '[
  {"input": "5\\n0 1\\n0 2\\n1 3\\n1 4\\n0", "output": "0 1 2 3 4"},
  {"input": "3\\n0 1\\n1 2\\n0", "output": "0 1 2"},
  {"input": "4\\n0 1\\n2 3\\n0", "output": "0 1"},
  {"input": "1\\n0", "output": "0"}
]'::jsonb
WHERE slug = 'parcours-graphe';
