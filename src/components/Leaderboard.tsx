import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '../lib/supabase';
import { Trophy, Medal, Award } from 'lucide-react';

export function Leaderboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('score', { ascending: false })
      .limit(100);

    if (data) {
      const rankedUsers = data.map((user, index) => ({
        ...user,
        rank: index + 1
      }));
      setUsers(rankedUsers);
    }
    setLoading(false);
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="text-yellow-400" size={24} />;
    if (rank === 2) return <Medal className="text-gray-400" size={24} />;
    if (rank === 3) return <Medal className="text-orange-400" size={24} />;
    return <Award className="text-blue-400" size={20} />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white text-xl">Loading leaderboard...</div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-3xl font-bold text-white mb-6">Global Leaderboard</h2>

      {users.length === 0 ? (
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-12 text-center">
          <Trophy className="text-gray-500 mx-auto mb-4" size={48} />
          <p className="text-gray-400 text-lg">No users yet</p>
          <p className="text-gray-500 mt-2">Be the first to join and compete!</p>
        </div>
      ) : (
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-900/50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Rank</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Username</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Score</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-800/30 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {getRankIcon(user.rank)}
                      <span className="text-white font-semibold">#{user.rank}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-white font-medium">{user.username}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-blue-400 font-semibold">{user.score}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-400">{new Date(user.created_at).toLocaleDateString()}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
