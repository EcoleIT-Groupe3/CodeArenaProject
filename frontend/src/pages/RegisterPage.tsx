import { Mail, Lock, User } from 'lucide-react';
import { useState } from 'react';

interface RegisterPageProps {
  onNavigate: (page: string) => void;
}

export default function RegisterPage({ onNavigate }: RegisterPageProps) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigate('home');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6 py-12">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <span className="text-white font-bold text-2xl">C</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Créer votre compte</h1>
          <p className="text-gray-600">
            Rejoignez des milliers de développeurs passionnés
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Nom d'utilisateur
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="johndoe"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Adresse e-mail
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirmer le mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-600 mt-1"
                required
              />
              <label className="text-sm text-gray-600">
                J'accepte les{' '}
                <button type="button" className="text-blue-600 hover:text-blue-700 font-medium">
                  conditions d'utilisation
                </button>{' '}
                et la{' '}
                <button type="button" className="text-blue-600 hover:text-blue-700 font-medium">
                  politique de confidentialité
                </button>
              </label>
            </div>

            <button
              type="submit"
              className="w-full px-6 py-3 text-base font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Créer mon compte
            </button>
          </form>

          <div className="mt-6 text-center">
            <span className="text-sm text-gray-600">Vous avez déjà un compte ? </span>
            <button
              onClick={() => onNavigate('login')}
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Se connecter
            </button>
          </div>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => onNavigate('home')}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            ← Retour à l'accueil
          </button>
        </div>
      </div>
    </div>
  );
}
