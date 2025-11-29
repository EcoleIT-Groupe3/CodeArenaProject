import { Calendar, Filter } from 'lucide-react';
import { useState } from 'react';
import Header from '../components/Header';
import ContestCard from '../components/ContestCard';

interface ContestsPageProps {
  onNavigate: (page: string) => void;
}

export default function ContestsPage({ onNavigate }: ContestsPageProps) {
  const [selectedStatus, setSelectedStatus] = useState('all');

  const contests = [
    {
      id: 1,
      title: 'CodeArena Championship 2025',
      description: 'Le plus grand concours de programmation de l\'année avec des prix exceptionnels',
      startDate: '15 Jan 2025',
      duration: '3 heures',
      participants: 2847,
      status: 'upcoming' as const
    },
    {
      id: 2,
      title: 'Weekly Challenge #47',
      description: 'Défi hebdomadaire avec 5 problèmes de difficulté croissante',
      startDate: 'En cours',
      duration: '2 heures',
      participants: 1523,
      status: 'active' as const
    },
    {
      id: 3,
      title: 'Algorithmes Avancés',
      description: 'Concours spécialisé sur les algorithmes complexes et structures de données',
      startDate: '20 Déc 2024',
      duration: '4 heures',
      participants: 3421,
      status: 'completed' as const
    },
    {
      id: 4,
      title: 'Speed Coding Sprint',
      description: 'Résolvez un maximum de problèmes en 90 minutes',
      startDate: '22 Jan 2025',
      duration: '90 minutes',
      participants: 892,
      status: 'upcoming' as const
    },
    {
      id: 5,
      title: 'Dynamic Programming Master',
      description: 'Testez vos compétences en programmation dynamique',
      startDate: '18 Déc 2024',
      duration: '2h30',
      participants: 1654,
      status: 'completed' as const
    },
    {
      id: 6,
      title: 'Beginner Friendly Contest',
      description: 'Concours parfait pour les débutants avec des problèmes simples',
      startDate: '25 Jan 2025',
      duration: '2 heures',
      participants: 456,
      status: 'upcoming' as const
    }
  ];

  const filteredContests = selectedStatus === 'all'
    ? contests
    : contests.filter(c => c.status === selectedStatus);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentPage="contests" isAuthenticated={true} onNavigate={onNavigate} />

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Participez aux concours<br />en temps réel
          </h1>
          <p className="text-lg text-gray-600">
            Affrontez les meilleurs développeurs dans des compétitions passionnantes
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-8 mb-8 text-white">
          <div className="flex items-center gap-3 mb-4">
            <Calendar size={28} />
            <h2 className="text-2xl font-bold">Prochain Concours</h2>
          </div>
          <h3 className="text-3xl font-bold mb-2">CodeArena Championship 2025</h3>
          <p className="text-blue-100 mb-6">
            Le plus grand événement de l'année avec plus de 2800 participants inscrits
          </p>
          <div className="grid grid-cols-3 gap-6 mb-6">
            <div>
              <div className="text-sm text-blue-100">Commence dans</div>
              <div className="text-2xl font-bold">19 jours</div>
            </div>
            <div>
              <div className="text-sm text-blue-100">Durée</div>
              <div className="text-2xl font-bold">3 heures</div>
            </div>
            <div>
              <div className="text-sm text-blue-100">Inscrits</div>
              <div className="text-2xl font-bold">2,847</div>
            </div>
          </div>
          <button
            onClick={() => alert('Inscription au concours réussie! Vous recevrez une notification avant le début.')}
            className="px-6 py-2.5 text-sm font-medium text-blue-600 bg-white rounded-lg hover:bg-blue-50 transition-colors"
          >
            S'inscrire maintenant
          </button>
        </div>

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">Tous les concours</h2>
          <div className="flex items-center gap-2">
            <Filter className="text-gray-400" size={20} />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent appearance-none bg-white"
            >
              <option value="all">Tous les statuts</option>
              <option value="upcoming">À venir</option>
              <option value="active">En cours</option>
              <option value="completed">Terminés</option>
            </select>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContests.map((contest) => (
            <ContestCard
              key={contest.id}
              id={contest.id}
              title={contest.title}
              description={contest.description}
              startDate={contest.startDate}
              duration={contest.duration}
              participants={contest.participants}
              status={contest.status}
              onNavigate={onNavigate}
              onClick={() => {
                alert(`Détails du concours: ${contest.title}`);
              }}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
