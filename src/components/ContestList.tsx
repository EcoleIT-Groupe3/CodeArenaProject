import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Contest } from '../lib/supabase';
import { Trophy, Calendar, Clock } from 'lucide-react';

export function ContestList() {
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContests();
  }, []);

  const loadContests = async () => {
    const { data, error } = await supabase
      .from('contests')
      .select('*')
      .order('start_time', { ascending: false });

    if (data) {
      setContests(data);
    }
    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-400 bg-green-900/30';
      case 'upcoming':
        return 'text-blue-400 bg-blue-900/30';
      case 'completed':
        return 'text-gray-400 bg-gray-900/30';
      default:
        return 'text-gray-400 bg-gray-900/30';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white text-xl">Loading contests...</div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-3xl font-bold text-white mb-6">Contests</h2>

      {contests.length === 0 ? (
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-12 text-center">
          <Trophy className="text-gray-500 mx-auto mb-4" size={48} />
          <p className="text-gray-400 text-lg">No contests available at the moment</p>
          <p className="text-gray-500 mt-2">Check back later for exciting coding competitions!</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {contests.map((contest) => (
            <div
              key={contest.id}
              className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6 hover:bg-slate-800/70 transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Trophy className="text-yellow-400" size={24} />
                    <h3 className="text-xl font-semibold text-white">{contest.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(contest.status)}`}>
                      {contest.status.toUpperCase()}
                    </span>
                  </div>

                  <p className="text-gray-300 mb-4">{contest.description}</p>

                  <div className="flex items-center gap-6 text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} />
                      <span>{new Date(contest.start_time).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={16} />
                      <span>
                        {new Date(contest.start_time).toLocaleTimeString()} - {new Date(contest.end_time).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
