import { Trophy, TrendingUp, Award } from 'lucide-react';
import { useState } from 'react';
import Header from '../components/Header';

interface LeaderboardPageProps {
  onNavigate: (page: string) => void;
}

export default function LeaderboardPage({ onNavigate }: LeaderboardPageProps) {
  const [timeRange, setTimeRange] = useState('global');

  const topUsers = [
    {
      rank: 1,
      username: 'AlgoMaster',
      rating: 3542,
      problemsSolved: 847,
      country: 'France',
      trend: '+45'
    },
    {
      rank: 2,
      username: 'CodeNinja',
      rating: 3487,
      problemsSolved: 823,
      country: 'Canada',
      trend: '+32'
    },
    {
      rank: 3,
      username: 'DevPro',
      rating: 3421,
      problemsSolved: 789,
      country: 'USA',
      trend: '+28'
    },
    {
      rank: 4,
      username: 'ByteWarrior',
      rating: 3398,
      problemsSolved: 756,
      country: 'Allemagne',
      trend: '+18'
    },
    {
      rank: 5,
      username: 'ScriptKing',
      rating: 3354,
      problemsSolved: 734,
      country: 'Japon',
      trend: '+25'
    },
    {
      rank: 6,
      username: 'DataWhiz',
      rating: 3312,
      problemsSolved: 698,
      country: 'Inde',
      trend: '+15'
    },
    {
      rank: 7,
      username: 'LogicLord',
      rating: 3287,
      problemsSolved: 671,
      country: 'Royaume-Uni',
      trend: '+12'
    },
    {
      rank: 8,
      username: 'PixelPusher',
      rating: 3265,
      problemsSolved: 654,
      country: 'Australie',
      trend: '+20'
    },
    {
      rank: 9,
      username: 'SyntaxSage',
      rating: 3241,
      problemsSolved: 642,
      country: 'Brésil',
      trend: '+8'
    },
    {
      rank: 10,
      username: 'BugHunter',
      rating: 3218,
      problemsSolved: 627,
      country: 'Espagne',
      trend: '+16'
    }
  ];

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'bg-yellow-100 text-yellow-700';
    if (rank === 2) return 'bg-gray-200 text-gray-700';
    if (rank === 3) return 'bg-orange-100 text-orange-700';
    return 'bg-blue-50 text-blue-700';
  };

  const getRankIcon = (rank: number) => {
    if (rank <= 3) return <Trophy size={20} />;
    return <Award size={20} />;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentPage="leaderboard" isAuthenticated={true} onNavigate={onNavigate} />

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Classement des développeurs
          </h1>
          <p className="text-lg text-gray-600">
            Découvrez les meilleurs programmeurs de la communauté
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Trophy className="text-yellow-600" size={20} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Top Élite</h3>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">127</div>
            <p className="text-sm text-gray-600">Utilisateurs au-dessus de 3000 points</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-blue-600" size={20} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Progression Moyenne</h3>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">+18.5</div>
            <p className="text-sm text-gray-600">Points par semaine</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Award className="text-green-600" size={20} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Participants Actifs</h3>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">45.2K</div>
            <p className="text-sm text-gray-600">Cette semaine</p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Classement Général</h2>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent appearance-none bg-white text-sm"
            >
              <option value="global">Tout temps</option>
              <option value="monthly">Ce mois</option>
              <option value="weekly">Cette semaine</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Rang
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Utilisateur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Problèmes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Pays
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Tendance
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {topUsers.map((user) => (
                  <tr key={user.rank} className="hover:bg-gray-50 cursor-pointer">
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg font-semibold ${getRankColor(user.rank)}`}>
                        {getRankIcon(user.rank)}
                        <span>#{user.rank}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {user.username[0]}
                        </div>
                        <span className="font-medium text-gray-900">{user.username}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-2xl font-bold text-blue-600">{user.rating}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-900 font-medium">{user.problemsSolved}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-600">{user.country}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 text-green-600 font-medium">
                        <TrendingUp size={16} />
                        {user.trend}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
