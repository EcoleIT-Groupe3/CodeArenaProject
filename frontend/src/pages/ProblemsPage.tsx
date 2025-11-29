import { Search, Filter } from 'lucide-react';
import { useState } from 'react';
import Header from '../components/Header';
import ProblemCard from '../components/ProblemCard';

interface ProblemsPageProps {
  onNavigate: (page: string) => void;
}

export default function ProblemsPage({ onNavigate }: ProblemsPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const problems = [
    {
      id: 1,
      title: 'Two Sum',
      difficulty: 'Facile' as const,
      category: 'Tableaux',
      acceptanceRate: 49.2,
      solvedCount: 8547,
      points: 100
    },
    {
      id: 2,
      title: 'Longest Substring',
      difficulty: 'Moyen' as const,
      category: 'Chaînes',
      acceptanceRate: 33.8,
      solvedCount: 5621,
      points: 200
    },
    {
      id: 3,
      title: 'Median of Two Arrays',
      difficulty: 'Difficile' as const,
      category: 'Tableaux',
      acceptanceRate: 34.5,
      solvedCount: 2847,
      points: 300
    },
    {
      id: 4,
      title: 'Reverse Integer',
      difficulty: 'Facile' as const,
      category: 'Mathématiques',
      acceptanceRate: 27.1,
      solvedCount: 7234,
      points: 100
    },
    {
      id: 5,
      title: 'Valid Parentheses',
      difficulty: 'Facile' as const,
      category: 'Pile',
      acceptanceRate: 40.6,
      solvedCount: 9821,
      points: 100
    },
    {
      id: 6,
      title: 'Merge Intervals',
      difficulty: 'Moyen' as const,
      category: 'Tableaux',
      acceptanceRate: 45.9,
      solvedCount: 4532,
      points: 200
    },
    {
      id: 7,
      title: 'N-Queens Problem',
      difficulty: 'Difficile' as const,
      category: 'Backtracking',
      acceptanceRate: 62.3,
      solvedCount: 1876,
      points: 300
    },
    {
      id: 8,
      title: 'Binary Tree Level Order',
      difficulty: 'Moyen' as const,
      category: 'Arbres',
      acceptanceRate: 61.2,
      solvedCount: 6341,
      points: 200
    },
    {
      id: 9,
      title: 'Maximum Subarray',
      difficulty: 'Moyen' as const,
      category: 'Dynamique',
      acceptanceRate: 50.1,
      solvedCount: 7654,
      points: 200
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentPage="problems" isAuthenticated={true} onNavigate={onNavigate} />

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Explorez les problèmes<br />de programmation
          </h1>
          <p className="text-lg text-gray-600">
            Plus de 500 problèmes de code pour améliorer vos compétences
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8">
          <div className="grid md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Rechercher un problème..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent appearance-none bg-white"
                >
                  <option value="all">Toutes difficultés</option>
                  <option value="facile">Facile</option>
                  <option value="moyen">Moyen</option>
                  <option value="difficile">Difficile</option>
                </select>
              </div>
            </div>

            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent appearance-none bg-white"
              >
                <option value="all">Toutes catégories</option>
                <option value="tableaux">Tableaux</option>
                <option value="chaines">Chaînes</option>
                <option value="arbres">Arbres</option>
                <option value="dynamique">Programmation Dynamique</option>
                <option value="graphes">Graphes</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {problems.map((problem) => (
            <ProblemCard
              key={problem.id}
              title={problem.title}
              difficulty={problem.difficulty}
              category={problem.category}
              acceptanceRate={problem.acceptanceRate}
              solvedCount={problem.solvedCount}
              points={problem.points}
              onClick={() => onNavigate('submission')}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
