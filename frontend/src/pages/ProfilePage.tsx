import { Trophy, Code, Award, Calendar, TrendingUp, Target } from 'lucide-react';
import Header from '../components/Header';

interface ProfilePageProps {
  onNavigate: (page: string) => void;
}

export default function ProfilePage({ onNavigate }: ProfilePageProps) {
  const recentSubmissions = [
    { problem: 'Two Sum', status: 'accepted', date: '2 heures', language: 'Python' },
    { problem: 'Longest Substring', status: 'accepted', date: '5 heures', language: 'JavaScript' },
    { problem: 'Merge Intervals', status: 'rejected', date: '1 jour', language: 'Python' },
    { problem: 'Valid Parentheses', status: 'accepted', date: '2 jours', language: 'Java' },
  ];

  const badges = [
    { name: '100 Problèmes', color: 'bg-blue-100 text-blue-700', icon: Code },
    { name: 'Première Place', color: 'bg-yellow-100 text-yellow-700', icon: Trophy },
    { name: 'Séquence 30j', color: 'bg-green-100 text-green-700', icon: Calendar },
    { name: 'Expert Algo', color: 'bg-pink-100 text-pink-700', icon: Award },
  ];

  const progressByCategory = [
    { category: 'Tableaux', solved: 47, total: 120, color: 'bg-blue-600' },
    { category: 'Chaînes', solved: 32, total: 85, color: 'bg-pink-600' },
    { category: 'Arbres', solved: 28, total: 70, color: 'bg-green-600' },
    { category: 'Dynamique', solved: 15, total: 95, color: 'bg-orange-600' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentPage="profile" isAuthenticated={true} onNavigate={onNavigate} />

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-bold mb-4">
                  JD
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">JohnDev</h2>
                <p className="text-gray-600 mb-3">Développeur Full Stack</p>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
                    Expert
                  </span>
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
                    France
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Rating</span>
                  <span className="text-2xl font-bold text-blue-600">2547</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Rang global</span>
                  <span className="font-semibold text-gray-900">#127</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Problèmes résolus</span>
                  <span className="font-semibold text-gray-900">122</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Concours participés</span>
                  <span className="font-semibold text-gray-900">18</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Membre depuis</span>
                  <span className="font-semibold text-gray-900">Mars 2024</span>
                </div>
              </div>

              <button className="w-full mt-6 px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                Modifier le profil
              </button>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-2">
                  <Target className="text-blue-600" size={20} />
                  <span className="text-sm text-gray-600">Taux de réussite</span>
                </div>
                <div className="text-3xl font-bold text-gray-900">78.5%</div>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="text-green-600" size={20} />
                  <span className="text-sm text-gray-600">Cette semaine</span>
                </div>
                <div className="text-3xl font-bold text-gray-900">+42</div>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-2">
                  <Calendar className="text-orange-600" size={20} />
                  <span className="text-sm text-gray-600">Séquence</span>
                </div>
                <div className="text-3xl font-bold text-gray-900">15j</div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Badges obtenus</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {badges.map((badge, index) => (
                  <div
                    key={index}
                    className={`${badge.color} rounded-xl p-4 text-center`}
                  >
                    <badge.icon className="mx-auto mb-2" size={24} />
                    <span className="text-xs font-medium">{badge.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Progression par catégorie</h3>
              <div className="space-y-4">
                {progressByCategory.map((item, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">{item.category}</span>
                      <span className="text-sm text-gray-600">
                        {item.solved}/{item.total}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`${item.color} h-2 rounded-full transition-all`}
                        style={{ width: `${(item.solved / item.total) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Soumissions récentes</h3>
              <div className="space-y-3">
                {recentSubmissions.map((submission, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <div>
                      <div className="font-medium text-gray-900 mb-1">{submission.problem}</div>
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <span>{submission.language}</span>
                        <span>•</span>
                        <span>{submission.date}</span>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        submission.status === 'accepted'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-pink-100 text-pink-700'
                      }`}
                    >
                      {submission.status === 'accepted' ? 'Accepté' : 'Rejeté'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
