import { User, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
  currentPage?: string;
  onNavigate?: (page: string) => void;
}

export default function Header({ currentPage, onNavigate }: HeaderProps) {
  const { user, profile, signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      onNavigate?.('home');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <button onClick={() => onNavigate?.('home')} className="flex items-center gap-2">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <span className="text-xl font-semibold text-gray-900">CodeArena</span>
            </button>

            <nav className="hidden md:flex items-center gap-6">
              <button
                onClick={() => onNavigate?.('home')}
                className={`text-sm font-medium ${currentPage === 'home' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
              >
                Accueil
              </button>
              <button
                onClick={() => onNavigate?.('problems')}
                className={`text-sm font-medium ${currentPage === 'problems' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
              >
                Problèmes
              </button>
              <button
                onClick={() => onNavigate?.('contests')}
                className={`text-sm font-medium ${currentPage === 'contests' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
              >
                Concours
              </button>
              <button
                onClick={() => onNavigate?.('rooms')}
                className={`text-sm font-medium ${currentPage === 'rooms' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
              >
                Salles
              </button>
              <button
                onClick={() => onNavigate?.('leaderboard')}
                className={`text-sm font-medium ${currentPage === 'leaderboard' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
              >
                Classement
              </button>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <button
                  onClick={() => onNavigate?.('profile')}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  <User size={18} />
                  <span>{profile?.username || 'Profil'}</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                  title="Déconnexion"
                >
                  <LogOut size={18} />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => onNavigate?.('login')}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  Connexion
                </button>
                <button
                  onClick={() => onNavigate?.('register')}
                  className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Inscription
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
