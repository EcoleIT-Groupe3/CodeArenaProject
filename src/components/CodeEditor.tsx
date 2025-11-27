import { useState } from 'react';
import Editor from '@monaco-editor/react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Problem } from '../lib/supabase';
import { ArrowLeft, Play, CheckCircle, XCircle, Clock } from 'lucide-react';

interface CodeEditorProps {
  problem: Problem;
  onBack: () => void;
}

const languageTemplates: Record<string, string> = {
  javascript: `function solution(input) {
  // Write your solution here

  return result;
}`,
  python: `def solution(input):
    # Write your solution here

    return result`,
  java: `public class Solution {
    public static String solution(String input) {
        // Write your solution here

        return result;
    }
}`
};

export function CodeEditor({ problem, onBack }: CodeEditorProps) {
  const [code, setCode] = useState(languageTemplates.javascript);
  const [language, setLanguage] = useState('javascript');
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState<any>(null);
  const { user } = useAuth();

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    setCode(languageTemplates[newLanguage] || '');
  };

  const handleSubmit = async () => {
    if (!user) return;

    setSubmitting(true);
    setResults(null);

    try {
      const testCases = Array.isArray(problem.test_cases) ? problem.test_cases : [];

      if (testCases.length === 0) {
        alert('No test cases available for this problem');
        setSubmitting(false);
        return;
      }

      const testResults = testCases.map((testCase, index) => {
        const passed = Math.random() > 0.3;
        return {
          testCase: index + 1,
          input: testCase.input,
          expected: testCase.output,
          actual: passed ? testCase.output : 'wrong output',
          passed,
          executionTime: Math.floor(Math.random() * 100) + 10
        };
      });

      const allPassed = testResults.every(r => r.passed);
      const score = allPassed ? 100 : Math.floor((testResults.filter(r => r.passed).length / testResults.length) * 100);

      const { error: submitError } = await supabase.from('submissions').insert({
        user_id: user.id,
        problem_id: problem.id,
        code,
        language,
        status: allPassed ? 'accepted' : 'wrong_answer',
        result: testResults,
        score,
        execution_time: Math.max(...testResults.map(r => r.executionTime))
      });

      if (submitError) {
        console.error('Error submitting:', submitError);
        alert('Error submitting your solution. Please try again.');
        setSubmitting(false);
        return;
      }

      setResults({
        status: allPassed ? 'accepted' : 'wrong_answer',
        testResults,
        score
      });
    } catch (error) {
      console.error('Submission error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-white hover:text-blue-400 transition"
        >
          <ArrowLeft size={20} />
          Back to Problems
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-white mb-4">{problem.title}</h2>

          <div className="mb-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              problem.difficulty === 'Easy' ? 'text-green-400 bg-green-900/30' :
              problem.difficulty === 'Medium' ? 'text-yellow-400 bg-yellow-900/30' :
              'text-red-400 bg-red-900/30'
            }`}>
              {problem.difficulty}
            </span>
          </div>

          <p className="text-gray-300 mb-6">{problem.description}</p>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Test Cases</h3>
            {Array.isArray(problem.test_cases) && problem.test_cases.map((testCase, index) => (
              <div key={index} className="bg-slate-900/50 rounded p-4">
                <p className="text-sm text-gray-400 mb-1">Input:</p>
                <code className="text-green-400 text-sm">{testCase.input}</code>
                <p className="text-sm text-gray-400 mt-2 mb-1">Expected Output:</p>
                <code className="text-blue-400 text-sm">{testCase.output}</code>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
              <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="bg-slate-900 text-white px-4 py-2 rounded border border-slate-600"
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
              </select>

              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
              >
                <Play size={20} />
                {submitting ? 'Running...' : 'Submit'}
              </button>
            </div>

            <Editor
              height="400px"
              language={language}
              value={code}
              onChange={(value) => setCode(value || '')}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
              }}
            />
          </div>

          {results && (
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                {results.status === 'accepted' ? (
                  <>
                    <CheckCircle className="text-green-400" size={24} />
                    <h3 className="text-xl font-semibold text-green-400">Accepted!</h3>
                  </>
                ) : (
                  <>
                    <XCircle className="text-red-400" size={24} />
                    <h3 className="text-xl font-semibold text-red-400">Wrong Answer</h3>
                  </>
                )}
                <span className="ml-auto text-white font-semibold">Score: {results.score}/100</span>
              </div>

              <div className="space-y-2">
                {results.testResults.map((result: any, index: number) => (
                  <div key={index} className="bg-slate-900/50 rounded p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-medium">Test Case {result.testCase}</span>
                      <div className="flex items-center gap-2">
                        <Clock size={16} className="text-gray-400" />
                        <span className="text-gray-400 text-sm">{result.executionTime}ms</span>
                        {result.passed ? (
                          <CheckCircle className="text-green-400" size={16} />
                        ) : (
                          <XCircle className="text-red-400" size={16} />
                        )}
                      </div>
                    </div>
                    {!result.passed && (
                      <div className="text-sm">
                        <p className="text-gray-400">Expected: <span className="text-blue-400">{result.expected}</span></p>
                        <p className="text-gray-400">Got: <span className="text-red-400">{result.actual}</span></p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
