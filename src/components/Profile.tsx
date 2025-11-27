import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { User as UserIcon, Mail, Calendar, Award, Code, CheckCircle, XCircle, TrendingUp } from 'lucide-react';
import type { User } from '../lib/supabase';

interface UserStats {
  totalSubmissions: number;
  acceptedSubmissions: number;
  totalScore: number;
  rank: number;
  easyCompleted: number;
  mediumCompleted: number;
  hardCompleted: number;
  recentSubmissions: Array<{
    id: string;
    problem_title: string;
    status: string;
    score: number;
    created_at: string;
  }>;
}

export function Profile() {
  const { user } = useAuth();
  const [userData, setUserData] = useState<User | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    const { data: userProfile } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (userProfile) {
      setUserData(userProfile);
    }

    const { data: submissions } = await supabase
      .from('submissions')
      .select(`
        id,
        status,
        score,
        submitted_at,
        problem_id,
        problems (title, difficulty)
      `)
      .eq('user_id', user.id)
      .order('submitted_at', { ascending: false });

    if (submissions) {
      const totalSubmissions = submissions.length;
      const acceptedSubmissions = submissions.filter(s => s.status === 'accepted').length;

      const uniqueProblems = new Map();
      submissions.forEach(sub => {
        if (sub.status === 'accepted' && !uniqueProblems.has(sub.problem_id)) {
          uniqueProblems.set(sub.problem_id, (sub as any).problems);
        }
      });

      const difficulties = Array.from(uniqueProblems.values());
      const easyCompleted = difficulties.filter((p: any) => p?.difficulty === 'Easy').length;
      const mediumCompleted = difficulties.filter((p: any) => p?.difficulty === 'Medium').length;
      const hardCompleted = difficulties.filter((p: any) => p?.difficulty === 'Hard').length;

      const rank = userProfile?.rank ?? 0;

      const recentSubmissions = submissions.slice(0, 10).map(sub => ({
        id: sub.id,
        problem_title: (sub as any).problems?.title || 'Unknown',
        status: sub.status,
        score: sub.score,
        created_at: sub.submitted_at
      }));

      setStats({
        totalSubmissions,
        acceptedSubmissions,
        totalScore: userProfile?.score || 0,
        rank: rank,
        easyCompleted,
        mediumCompleted,
        hardCompleted,
        recentSubmissions
      });
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white text-xl">Loading profile...</div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white text-xl">Profile not found</div>
      </div>
    );
  }

  const acceptanceRate = stats && stats.totalSubmissions > 0
    ? Math.round((stats.acceptedSubmissions / stats.totalSubmissions) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-white mb-6">My Profile</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
                <UserIcon className="text-white" size={48} />
              </div>

              <h3 className="text-2xl font-bold text-white mb-1">{userData.username}</h3>

              <div className="flex items-center gap-2 text-gray-400 mb-4">
                <Mail size={16} />
                <span className="text-sm">{userData.email}</span>
              </div>

              <div className="flex items-center gap-2 text-gray-400 mb-6">
                <Calendar size={16} />
                <span className="text-sm">
                  Joined {new Date(userData.created_at).toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric'
                  })}
                </span>
              </div>

              <div className="w-full space-y-3">
                <div className="bg-slate-900/50 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-blue-400">{stats?.totalScore || 0}</div>
                  <div className="text-sm text-gray-400 mt-1">Total Score</div>
                </div>

                <div className="bg-slate-900/50 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-yellow-400">#{stats?.rank || '-'}</div>
                  <div className="text-sm text-gray-400 mt-1">Global Rank</div>
                </div>

                <div className="bg-slate-900/50 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-green-400">{acceptanceRate}%</div>
                  <div className="text-sm text-gray-400 mt-1">Acceptance Rate</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Award className="text-blue-400" size={24} />
              Statistics
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-900/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Code className="text-blue-400" size={20} />
                  <span className="text-gray-400 text-sm">Total Submissions</span>
                </div>
                <div className="text-2xl font-bold text-white">{stats?.totalSubmissions || 0}</div>
              </div>

              <div className="bg-slate-900/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="text-green-400" size={20} />
                  <span className="text-gray-400 text-sm">Accepted</span>
                </div>
                <div className="text-2xl font-bold text-white">{stats?.acceptedSubmissions || 0}</div>
              </div>

              <div className="bg-slate-900/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <span className="text-gray-400 text-sm">Easy Solved</span>
                </div>
                <div className="text-2xl font-bold text-white">{stats?.easyCompleted || 0}</div>
              </div>

              <div className="bg-slate-900/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <span className="text-gray-400 text-sm">Medium Solved</span>
                </div>
                <div className="text-2xl font-bold text-white">{stats?.mediumCompleted || 0}</div>
              </div>

              <div className="bg-slate-900/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <span className="text-gray-400 text-sm">Hard Solved</span>
                </div>
                <div className="text-2xl font-bold text-white">{stats?.hardCompleted || 0}</div>
              </div>

              <div className="bg-slate-900/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="text-purple-400" size={20} />
                  <span className="text-gray-400 text-sm">Total Solved</span>
                </div>
                <div className="text-2xl font-bold text-white">
                  {(stats?.easyCompleted || 0) + (stats?.mediumCompleted || 0) + (stats?.hardCompleted || 0)}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4">Recent Submissions</h3>

            {stats?.recentSubmissions && stats.recentSubmissions.length > 0 ? (
              <div className="space-y-2">
                {stats.recentSubmissions.map((submission) => (
                  <div
                    key={submission.id}
                    className="bg-slate-900/50 rounded-lg p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      {submission.status === 'accepted' ? (
                        <CheckCircle className="text-green-400" size={20} />
                      ) : (
                        <XCircle className="text-red-400" size={20} />
                      )}
                      <div>
                        <div className="text-white font-medium">{submission.problem_title}</div>
                        <div className="text-sm text-gray-400">
                          {new Date(submission.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-semibold ${
                        submission.status === 'accepted' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {submission.status === 'accepted' ? 'Accepted' : 'Wrong Answer'}
                      </div>
                      <div className="text-sm text-gray-400">Score: {submission.score}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Code className="text-gray-500 mx-auto mb-3" size={48} />
                <p className="text-gray-400">No submissions yet</p>
                <p className="text-gray-500 text-sm mt-1">Start solving problems to see your submissions here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
