import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Trophy, Medal, Award, Crown, Zap, Clock } from 'lucide-react';

interface LeaderboardEntry {
  id: string;
  user_id: string;
  daily_score: number;
  daily_rank: number;
  problems_solved: number;
  total_time: number;
  user_username: string;
  user_email: string;
}

interface DailyChallengeLeaderboardProps {
  challengeId: string;
}

export function DailyChallengeLeaderboard({ challengeId }: DailyChallengeLeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    loadLeaderboard();

    const interval = setInterval(() => {
      loadLeaderboard();
    }, 10000);

    setRefreshInterval(interval);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [challengeId]);

  const loadLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from('daily_challenge_participants')
        .select(`
          id,
          user_id,
          daily_score,
          daily_rank,
          problems_solved,
          total_time,
          user:user_id (
            username,
            email
          )
        `)
        .eq('challenge_id', challengeId)
        .order('daily_rank', { ascending: true })
        .limit(100);

      if (error) {
        console.error('Error loading leaderboard:', error);
      } else if (data) {
        const formattedData = data.map((entry: any) => ({
          id: entry.id,
          user_id: entry.user_id,
          daily_score: entry.daily_score,
          daily_rank: entry.daily_rank,
          problems_solved: entry.problems_solved,
          total_time: entry.total_time,
          user_username: entry.user?.username || 'Unknown',
          user_email: entry.user?.email || ''
        }));
        setLeaderboard(formattedData);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error in loadLeaderboard:', error);
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="text-yellow-400" size={24} />;
    if (rank === 2) return <Medal className="text-gray-300" size={24} />;
    if (rank === 3) return <Medal className="text-orange-400" size={24} />;
    return <Award className="text-blue-400" size={20} />;
  };

  const getRankBackground = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 border-yellow-500/30';
    if (rank === 2) return 'bg-gradient-to-r from-gray-400/10 to-gray-500/10 border-gray-400/30';
    if (rank === 3) return 'bg-gradient-to-r from-orange-500/10 to-orange-600/10 border-orange-500/30';
    return 'bg-slate-900/30 border-slate-700/50';
  };

  const formatTime = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${seconds}s`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white text-xl">Loading leaderboard...</div>
      </div>
    );
  }

  if (leaderboard.length === 0) {
    return (
      <div className="text-center py-12">
        <Trophy className="text-gray-500 mx-auto mb-4" size={48} />
        <p className="text-gray-400 text-lg">No participants yet</p>
        <p className="text-gray-500 mt-2">Be the first to solve a problem!</p>
      </div>
    );
  }

  const currentUserEntry = leaderboard.find(entry => entry.user_id === user?.id);

  return (
    <div className="space-y-6">
      {currentUserEntry && (
        <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-blue-500/20 rounded-full p-3">
                <Zap className="text-blue-400" size={24} />
              </div>
              <div>
                <div className="text-sm text-gray-400">Your Position</div>
                <div className="text-2xl font-bold text-white">Rank #{currentUserEntry.daily_rank}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-400">Your Score</div>
              <div className="text-2xl font-bold text-yellow-400">{currentUserEntry.daily_score} pts</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-400">Problems Solved</div>
              <div className="text-2xl font-bold text-green-400">{currentUserEntry.problems_solved}</div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white">Top Performers</h3>
          <div className="text-sm text-gray-400">
            {leaderboard.length} participant{leaderboard.length !== 1 ? 's' : ''}
          </div>
        </div>

        {leaderboard.map((entry) => {
          const isCurrentUser = entry.user_id === user?.id;

          return (
            <div
              key={entry.id}
              className={`rounded-lg p-4 border transition ${getRankBackground(entry.daily_rank)} ${
                isCurrentUser ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="flex items-center gap-3 min-w-[80px]">
                    {getRankIcon(entry.daily_rank)}
                    <span className={`text-xl font-bold ${
                      entry.daily_rank <= 3 ? 'text-white' : 'text-gray-400'
                    }`}>
                      #{entry.daily_rank}
                    </span>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`font-semibold ${
                        isCurrentUser ? 'text-blue-400' : 'text-white'
                      }`}>
                        {entry.user_username}
                      </span>
                      {isCurrentUser && (
                        <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                          You
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">{entry.user_email}</div>
                  </div>
                </div>

                <div className="flex items-center gap-8">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-400">{entry.daily_score}</div>
                    <div className="text-xs text-gray-400">Points</div>
                  </div>

                  <div className="text-center min-w-[60px]">
                    <div className="text-lg font-semibold text-green-400">{entry.problems_solved}</div>
                    <div className="text-xs text-gray-400">Solved</div>
                  </div>

                  <div className="text-center min-w-[80px]">
                    <div className="flex items-center gap-1 text-gray-300">
                      <Clock size={14} />
                      <span className="text-sm font-medium">{formatTime(entry.total_time)}</span>
                    </div>
                    <div className="text-xs text-gray-400">Total Time</div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-slate-900/50 rounded-lg p-4 text-center border border-slate-700">
        <div className="text-sm text-gray-400">
          Leaderboard updates automatically every 10 seconds
        </div>
      </div>
    </div>
  );
}
