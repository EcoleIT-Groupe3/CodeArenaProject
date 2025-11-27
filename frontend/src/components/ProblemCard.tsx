import { Code, Users, TrendingUp } from 'lucide-react';

interface ProblemCardProps {
  title: string;
  difficulty: 'Facile' | 'Moyen' | 'Difficile';
  category: string;
  acceptanceRate: number;
  solvedCount: number;
  points: number;
  onClick?: () => void;
}

export default function ProblemCard({
  title,
  difficulty,
  category,
  acceptanceRate,
  solvedCount,
  points,
  onClick
}: ProblemCardProps) {
  const difficultyColors = {
    'Facile': 'bg-green-100 text-green-700',
    'Moyen': 'bg-orange-100 text-orange-700',
    'Difficile': 'bg-pink-100 text-pink-700'
  };

  return (
    <div
      onClick={onClick}
      className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow cursor-pointer"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${difficultyColors[difficulty]}`}>
              {difficulty}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
              {category}
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-blue-600">{points}</div>
          <div className="text-xs text-gray-500">points</div>
        </div>
      </div>

      <div className="flex items-center gap-6 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <TrendingUp size={16} />
          <span>{acceptanceRate}%</span>
        </div>
        <div className="flex items-center gap-2">
          <Users size={16} />
          <span>{solvedCount.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-2">
          <Code size={16} />
        </div>
      </div>
    </div>
  );
}
