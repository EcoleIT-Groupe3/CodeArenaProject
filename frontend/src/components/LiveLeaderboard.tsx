import { useEffect, useState } from 'react';
import { roomService } from '../services/api';

interface Participant {
  id: string;
  user_id: string;
  score: number;
  rank: number | null;
  problems_solved: number;
  profile: {
    username: string;
    full_name?: string;
  };
}

interface LiveLeaderboardProps {
  roomId: string;
}

export default function LiveLeaderboard({ roomId }: LiveLeaderboardProps) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadParticipants();

    const subscription = roomService.subscribeToRoom(roomId, () => {
      loadParticipants();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [roomId]);

  const loadParticipants = async () => {
    try {
      const data = await roomService.getRoomParticipants(roomId);
      setParticipants(data);
    } catch (error) {
      console.error('Failed to load participants:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-6">
        <p className="text-center text-gray-500 dark:text-gray-400">Loading leaderboard...</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg">
      <div className="p-4 border-b border-gray-300 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Live Leaderboard
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {participants.length} participant{participants.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="overflow-y-auto max-h-96">
        {participants.length === 0 ? (
          <p className="text-center py-8 text-gray-500 dark:text-gray-400">
            No participants yet
          </p>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {participants.map((participant, index) => (
              <div
                key={participant.id}
                className={`p-4 flex items-center space-x-4 ${
                  index === 0 ? 'bg-yellow-50 dark:bg-yellow-900/20' :
                  index === 1 ? 'bg-gray-100 dark:bg-gray-700/20' :
                  index === 2 ? 'bg-orange-50 dark:bg-orange-900/20' :
                  ''
                }`}
              >
                <div className="flex-shrink-0 w-8 text-center">
                  {index === 0 && <span className="text-2xl">🥇</span>}
                  {index === 1 && <span className="text-2xl">🥈</span>}
                  {index === 2 && <span className="text-2xl">🥉</span>}
                  {index > 2 && (
                    <span className="text-lg font-semibold text-gray-600 dark:text-gray-400">
                      {index + 1}
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white truncate">
                    {participant.profile.username}
                  </p>
                  {participant.profile.full_name && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {participant.profile.full_name}
                    </p>
                  )}
                </div>

                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {participant.score}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {participant.problems_solved} solved
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
