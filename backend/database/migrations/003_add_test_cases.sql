-- Add test_cases column to problems table
ALTER TABLE problems ADD COLUMN IF NOT EXISTS test_cases JSONB DEFAULT '[]'::jsonb;

-- Add comment explaining the structure
COMMENT ON COLUMN problems.test_cases IS 'Array of test cases with input and output: [{"input": "...", "output": "..."}]';
