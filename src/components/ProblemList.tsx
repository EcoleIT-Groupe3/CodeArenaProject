import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Problem } from '../lib/supabase';
import { Code, Clock, Zap } from 'lucide-react';

interface ProblemListProps {
  onSelectProblem: (problem: Problem) => void;
}

export function ProblemList({ onSelectProblem }: ProblemListProps) {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProblems();
  }, []);

  const loadProblems = async () => {
    const { data, error } = await supabase
      .from('problems')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      setProblems(data);
    }
    setLoading(false);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'text-green-400 bg-green-900/30';
      case 'Medium':
        return 'text-yellow-400 bg-yellow-900/30';
      case 'Hard':
        return 'text-red-400 bg-red-900/30';
      default:
        return 'text-gray-400 bg-gray-900/30';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white text-xl">Loading problems...</div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-3xl font-bold text-white mb-6">Practice Problems</h2>

      <div className="grid gap-4">
        {problems.map((problem) => (
          <div
            key={problem.id}
            className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6 hover:bg-slate-800/70 transition cursor-pointer"
            onClick={() => onSelectProblem(problem)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Code className="text-blue-400" size={24} />
                  <h3 className="text-xl font-semibold text-white">{problem.title}</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(problem.difficulty)}`}>
                    {problem.difficulty}
                  </span>
                </div>

                <p className="text-gray-300 mb-4">{problem.description}</p>

                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <div className="flex items-center gap-1">
                    <Clock size={16} />
                    <span>{problem.time_limit}ms</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Zap size={16} />
                    <span>{Array.isArray(problem.test_cases) ? problem.test_cases.length : 0} test cases</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
