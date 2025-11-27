import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, Trophy, Clock, Users, Zap, Award } from 'lucide-react';
import type { Problem } from '../lib/supabase';
import { ChallengeProblem } from './ChallengeProblem';
import { DailyChallengeLeaderboard } from './DailyChallengeLeaderboard';

interface DailyChallengeData {
  id: string;
  challenge_date: string;
  title: string;
  description: string;
  problem_ids: string[];
  total_participants: number;
  status: string;
}

interface ParticipantStats {
  daily_score: number;
  daily_rank: number;
  problems_solved: number;
  total_time: number;
}

export function DailyChallenge() {
  const [challenge, setChallenge] = useState<DailyChallengeData | null>(null);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  const [userStats, setUserStats] = useState<ParticipantStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'problems' | 'leaderboard'>('problems');
  const { user } = useAuth();

  useEffect(() => {
    loadTodayChallenge();
  }, [user]);

  const loadTodayChallenge = async () => {
    if (!user) return;

    try {
      const today = new Date().toISOString().split('T')[0];

      const { data: challengeData, error: challengeError } = await supabase
        .from('daily_challenges')
        .select('*')
        .eq('challenge_date', today)
        .maybeSingle();

      if (challengeError) {
        console.error('Error loading challenge:', challengeError);
        setLoading(false);
        return;
      }

      if (!challengeData) {
        const { data: newChallenge, error: createError } = await supabase
          .rpc('generate_daily_challenge', { p_date: today });

        if (createError) {
          console.error('Error creating challenge:', createError);
        } else {
          await loadTodayChallenge();
        }
        return;
      }

      setChallenge(challengeData);

      const problemIds = Array.isArray(challengeData.problem_ids)
        ? challengeData.problem_ids
        : [];

      if (problemIds.length > 0) {
        const { data: problemsData } = await supabase
          .from('problems')
          .select('*')
          .in('id', problemIds);

        if (problemsData) {
          setProblems(problemsData);
        }
      }

      const { data: statsData } = await supabase
        .from('daily_challenge_participants')
        .select('*')
        .eq('challenge_id', challengeData.id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (statsData) {
        setUserStats(statsData);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error in loadTodayChallenge:', error);
      setLoading(false);
    }
  };

  const handleProblemComplete = () => {
    setSelectedProblem(null);
    loadTodayChallenge();
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

  const getDifficultyPoints = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return 100;
      case 'Medium':
        return 200;
      case 'Hard':
        return 300;
      default:
        return 100;
    }
  };

  const isProblemSolved = (problemId: string) => {
    return false;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white text-xl">Loading today's challenge...</div>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Calendar className="text-gray-500 mx-auto mb-4" size={48} />
          <p className="text-gray-400 text-lg">No challenge available today</p>
          <p className="text-gray-500 mt-2">Check back tomorrow!</p>
        </div>
      </div>
    );
  }

  if (selectedProblem) {
    return (
      <ChallengeProblem
        problem={selectedProblem}
        challengeId={challenge.id}
        onBack={handleProblemComplete}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Zap className="text-yellow-300" size={32} />
              <h2 className="text-3xl font-bold">{challenge.title}</h2>
            </div>
            <p className="text-blue-100 mb-4">{challenge.description}</p>
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Calendar size={18} />
                <span>{new Date(challenge.challenge_date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users size={18} />
                <span>{challenge.total_participants} Participants</span>
              </div>
            </div>
          </div>

          {userStats && (
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 min-w-[200px]">
              <div className="text-center mb-3">
                <div className="text-3xl font-bold text-yellow-300">{userStats.daily_score}</div>
                <div className="text-sm text-blue-100">Your Score Today</div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="text-center">
                  <div className="font-semibold text-lg">#{userStats.daily_rank}</div>
                  <div className="text-blue-100">Rank</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-lg">{userStats.problems_solved}/{problems.length}</div>
                  <div className="text-blue-100">Solved</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg">
        <div className="flex border-b border-slate-700">
          <button
            onClick={() => setActiveTab('problems')}
            className={`flex-1 px-6 py-4 font-semibold transition ${
              activeTab === 'problems'
                ? 'text-blue-400 border-b-2 border-blue-400 bg-slate-800/50'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Trophy size={20} />
              Problems ({problems.length})
            </div>
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`flex-1 px-6 py-4 font-semibold transition ${
              activeTab === 'leaderboard'
                ? 'text-blue-400 border-b-2 border-blue-400 bg-slate-800/50'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Award size={20} />
              Leaderboard
            </div>
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'problems' ? (
            <div className="space-y-4">
              {problems.length === 0 ? (
                <div className="text-center py-12">
                  <Trophy className="text-gray-500 mx-auto mb-4" size={48} />
                  <p className="text-gray-400">No problems available for today's challenge</p>
                </div>
              ) : (
                problems.map((problem, index) => (
                  <div
                    key={problem.id}
                    className="bg-slate-900/50 rounded-lg p-5 hover:bg-slate-900/70 transition cursor-pointer border border-slate-700/50"
                    onClick={() => setSelectedProblem(problem)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center font-bold text-white">
                          {index + 1}
                        </div>

                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-white mb-1">{problem.title}</h3>
                          <p className="text-gray-400 text-sm line-clamp-1">{problem.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-yellow-400 font-bold text-lg">
                            {getDifficultyPoints(problem.difficulty)} pts
                          </div>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(problem.difficulty)}`}>
                            {problem.difficulty}
                          </span>
                        </div>

                        {isProblemSolved(problem.id) && (
                          <div className="bg-green-500/20 rounded-full p-2">
                            <Trophy className="text-green-400" size={20} />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock size={14} />
                        <span>Time Limit: {problem.time_limit}ms</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>Memory: {problem.memory_limit}MB</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <DailyChallengeLeaderboard challengeId={challenge.id} />
          )}
        </div>
      </div>
    </div>
  );
}
