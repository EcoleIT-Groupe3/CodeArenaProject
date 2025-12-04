import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface ExecutionRequest {
  code: string;
  language: string;
  test_cases: Array<{
    input: string;
    expected_output: string;
  }>;
  problem_id: string;
  room_id?: string;
}

interface TestResult {
  passed: boolean;
  input: string;
  expected: string;
  actual: string;
  execution_time: number;
  memory_used: number;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { code, language, test_cases, problem_id, room_id }: ExecutionRequest = await req.json();

    if (language !== 'python') {
      throw new Error('Only Python is supported at this time');
    }

    const results: TestResult[] = [];
    let totalTime = 0;
    let maxMemory = 0;

    for (const testCase of test_cases) {
      const startTime = Date.now();
      
      const tempFile = await Deno.makeTempFile({ suffix: '.py' });
      await Deno.writeTextFile(tempFile, code);

      const process = new Deno.Command('python3', {
        args: ['-c', code],
        stdin: 'piped',
        stdout: 'piped',
        stderr: 'piped',
      });

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      try {
        const child = process.spawn();
        
        const writer = child.stdin.getWriter();
        await writer.write(new TextEncoder().encode(testCase.input));
        await writer.close();

        const { code: exitCode, stdout, stderr } = await child.output();
        clearTimeout(timeoutId);

        const executionTime = Date.now() - startTime;
        totalTime += executionTime;

        const output = new TextDecoder().decode(stdout).trim();
        const errorOutput = new TextDecoder().decode(stderr).trim();

        if (exitCode !== 0 || errorOutput) {
          results.push({
            passed: false,
            input: testCase.input,
            expected: testCase.expected_output,
            actual: errorOutput || output,
            execution_time: executionTime,
            memory_used: 0,
          });
        } else {
          const passed = output === testCase.expected_output.trim();
          results.push({
            passed,
            input: testCase.input,
            expected: testCase.expected_output,
            actual: output,
            execution_time: executionTime,
            memory_used: 0,
          });
        }
      } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
          results.push({
            passed: false,
            input: testCase.input,
            expected: testCase.expected_output,
            actual: 'Time Limit Exceeded (5s)',
            execution_time: 5000,
            memory_used: 0,
          });
        } else {
          throw error;
        }
      } finally {
        try {
          await Deno.remove(tempFile);
        } catch {}
      }
    }

    const allPassed = results.every(r => r.passed);
    const status = allPassed ? 'accepted' : 'rejected';

    const { data: submission, error: submissionError } = await supabaseClient
      .from('submissions')
      .insert({
        user_id: user.id,
        problem_id,
        code,
        language,
        status,
        execution_time_ms: totalTime,
        memory_used_kb: maxMemory,
      })
      .select()
      .single();

    if (submissionError) {
      console.error('Submission error:', submissionError);
    }

    if (room_id && allPassed && submission) {
      const { data: problem } = await supabaseClient
        .from('problems')
        .select('points')
        .eq('id', problem_id)
        .single();

      const points = problem?.points || 100;
      const timeBonus = Math.max(0, 100 - Math.floor(totalTime / 1000));
      const totalPoints = points + timeBonus;

      await supabaseClient
        .from('room_problem_attempts')
        .insert({
          room_id,
          user_id: user.id,
          problem_id,
          submission_id: submission.id,
          time_taken: Math.floor(totalTime / 1000),
          points_earned: totalPoints,
        });

      const { data: currentParticipant } = await supabaseClient
        .from('room_participants')
        .select('score, problems_solved')
        .eq('room_id', room_id)
        .eq('user_id', user.id)
        .single();

      if (currentParticipant) {
        await supabaseClient
          .from('room_participants')
          .update({
            score: currentParticipant.score + totalPoints,
            problems_solved: currentParticipant.problems_solved + 1,
            last_submission_at: new Date().toISOString(),
          })
          .eq('room_id', room_id)
          .eq('user_id', user.id);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        status,
        results,
        execution_time: totalTime,
        memory_used: maxMemory,
        submission_id: submission?.id,
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Internal server error',
      }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
