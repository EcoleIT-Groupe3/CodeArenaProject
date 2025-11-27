import { Calendar, Users, Trophy } from 'lucide-react';

interface ContestCardProps {
  title: string;
  description: string;
  startDate: string;
  duration: string;
  participants: number;
  status: 'upcoming' | 'active' | 'completed';
  onClick?: () => void;
}

export default function ContestCard({
  title,
  description,
  startDate,
  duration,
  participants,
  status,
  onClick
}: ContestCardProps) {
  const statusColors = {
    'upcoming': 'bg-blue-100 text-blue-700',
    'active': 'bg-green-100 text-green-700',
    'completed': 'bg-gray-100 text-gray-700'
  };

  const statusLabels = {
    'upcoming': 'À venir',
    'active': 'En cours',
    'completed': 'Terminé'
  };

  return (
    <div
      onClick={onClick}
      className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow cursor-pointer"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="text-blue-600" size={24} />
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>
          <p className="text-sm text-gray-600 mb-3">{description}</p>
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${statusColors[status]}`}>
            {statusLabels[status]}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-6 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <Calendar size={16} />
          <span>{startDate}</span>
        </div>
        <div className="flex items-center gap-2">
          <span>{duration}</span>
        </div>
        <div className="flex items-center gap-2">
          <Users size={16} />
          <span>{participants.toLocaleString()}</span>
        </div>
      </div>

      <button className="w-full mt-4 px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
        {status === 'active' ? 'Participer maintenant' : status === 'upcoming' ? "S'inscrire" : 'Voir les résultats'}
      </button>
    </div>
  );
}
