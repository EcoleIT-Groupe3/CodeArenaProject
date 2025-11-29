import { Trophy, Code, Award, Calendar, TrendingUp, Target, Loader } from 'lucide-react';
import { useEffect, useState } from 'react';
import Header from '../components/Header';
import { useAuth } from '../contexts/AuthContext';
import { submissionService } from '../services/api';

interface ProfilePageProps {
  onNavigate: (page: string) => void;
}

export default function ProfilePage({ onNavigate }: ProfilePageProps) {
  const { user, profile, loading: authLoading } = useAuth();
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [rank, setRank] = useState<number | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      onNavigate('login');
      return;
    }

    if (user) {
      loadData();
    }
  }, [user, authLoading]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [submissionsData, leaderboardData] = await Promise.all([
        submissionService.getMySubmissions(10),
        fetch(`${import.meta.env.VITE_API_URL}/leaderboard`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        }).then(res => res.json()),
      ]);

      setSubmissions(submissionsData || []);

      const userIndex = leaderboardData.findIndex((entry: any) => entry.id === user?.id);
      if (userIndex !== -1) {
        setRank(userIndex + 1);
      }
    } catch (error) {
      console.error('Error loading profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header currentPage="profile" onNavigate={onNavigate} />
        <div className="flex items-center justify-center h-96">
          <Loader className="animate-spin text-blue-600" size={40} />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header currentPage="profile" onNavigate={onNavigate} />
        <div className="flex items-center justify-center h-96">
          <p className="text-gray-600">Profil non trouvé</p>
        </div>
      </div>
    );
  }

  const acceptedSubmissions = submissions.filter(s => s.status === 'accepted').length;
  const totalSubmissions = submissions.length;
  const successRate = totalSubmissions > 0 ? ((acceptedSubmissions / totalSubmissions) * 100).toFixed(1) : '0';

  const memberSince = new Date(profile.created_at).toLocaleDateString('fr-FR', {
    month: 'long',
    year: 'numeric',
  });

  const getInitials = () => {
    if (profile.full_name) {
      return profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return profile.username.slice(0, 2).toUpperCase();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} min`;
    if (diffHours < 24) return `${diffHours}h`;
    return `${diffDays}j`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentPage="profile" onNavigate={onNavigate} />

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-bold mb-4">
                  {getInitials()}
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">{profile.username}</h2>
                <p className="text-gray-600 mb-3">{profile.full_name || 'Développeur'}</p>
                <div className="flex items-center gap-2 flex-wrap justify-center">
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
                    {profile.rating >= 2000 ? 'Expert' : profile.rating >= 1500 ? 'Avancé' : 'Intermédiaire'}
                  </span>
                  {profile.country && (
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
                      {profile.country}
                    </span>
                  )}
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Rating</span>
                  <span className="text-2xl font-bold text-blue-600">{profile.rating}</span>
                </div>
                {rank && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Rang global</span>
                    <span className="font-semibold text-gray-900">#{rank}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Problèmes résolus</span>
                  <span className="font-semibold text-gray-900">{profile.problems_solved}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Concours participés</span>
                  <span className="font-semibold text-gray-900">{profile.contests_participated}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Membre depuis</span>
                  <span className="font-semibold text-gray-900">{memberSince}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-2">
                  <Target className="text-blue-600" size={20} />
                  <span className="text-sm text-gray-600">Taux de réussite</span>
                </div>
                <div className="text-3xl font-bold text-gray-900">{successRate}%</div>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="text-green-600" size={20} />
                  <span className="text-sm text-gray-600">Points totaux</span>
                </div>
                <div className="text-3xl font-bold text-gray-900">{profile.rating}</div>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-2">
                  <Code className="text-orange-600" size={20} />
                  <span className="text-sm text-gray-600">Soumissions</span>
                </div>
                <div className="text-3xl font-bold text-gray-900">{totalSubmissions}</div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Soumissions récentes</h3>
              {submissions.length === 0 ? (
                <p className="text-center text-gray-500 py-8">Aucune soumission pour le moment</p>
              ) : (
                <div className="space-y-3">
                  {submissions.map((submission: any) => (
                    <div
                      key={submission.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <div>
                        <div className="font-medium text-gray-900 mb-1">
                          {submission.problems?.title || 'Problème inconnu'}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <span>{submission.language}</span>
                          <span>•</span>
                          <span>{formatDate(submission.created_at)}</span>
                          {submission.execution_time && (
                            <>
                              <span>•</span>
                              <span>{submission.execution_time}ms</span>
                            </>
                          )}
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          submission.status === 'accepted'
                            ? 'bg-green-100 text-green-700'
                            : submission.status === 'rejected'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {submission.status === 'accepted'
                          ? 'Accepté'
                          : submission.status === 'rejected'
                          ? 'Rejeté'
                          : 'En attente'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
