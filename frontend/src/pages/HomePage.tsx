import { Code, Users, Trophy, Zap } from 'lucide-react';
import Header from '../components/Header';

interface HomePageProps {
  onNavigate: (page: string) => void;
}

export default function HomePage({ onNavigate }: HomePageProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentPage="home" isAuthenticated={false} onNavigate={onNavigate} />

      <main className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Défiez les meilleurs<br />développeurs en temps<br />réel
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Rejoignez une communauté de développeurs passionnés, résolvez des problèmes de code
            et participez à des concours pour améliorer vos compétences.
          </p>
          <button
            onClick={() => onNavigate('register')}
            className="px-8 py-3.5 text-base font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Commencer gratuitement
          </button>
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-12 mb-16 text-white">
          <div className="flex items-center gap-3 mb-4">
            <Trophy size={32} />
            <h2 className="text-2xl font-bold">Prochain Concours</h2>
          </div>
          <h3 className="text-3xl font-bold mb-2">ACM ICPC Équivalent</h3>
          <p className="text-blue-100 mb-6">
            Rejoignez des milliers de développeurs dans ce concours de programmation compétitive
          </p>
          <div className="flex items-center gap-8 mb-6">
            <div>
              <div className="text-sm text-blue-100">Commence dans</div>
              <div className="text-2xl font-bold">2j 14h 30m</div>
            </div>
            <div>
              <div className="text-sm text-blue-100">Durée</div>
              <div className="text-2xl font-bold">3 heures</div>
            </div>
          </div>
          <button
            onClick={() => onNavigate('contests')}
            className="px-6 py-2.5 text-sm font-medium text-blue-600 bg-white rounded-lg hover:bg-blue-50 transition-colors"
          >
            Voir les détails
          </button>
        </div>

        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Tout ce dont vous avez besoin pour exceller
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Code className="text-blue-600" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                +500 Problèmes
              </h3>
              <p className="text-sm text-gray-600">
                Des problèmes de tous niveaux pour progresser à votre rythme
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
                <Trophy className="text-pink-600" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Concours hebdomadaires
              </h3>
              <p className="text-sm text-gray-600">
                Participez à des compétitions en temps réel chaque semaine
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="text-orange-600" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Communauté active
              </h3>
              <p className="text-sm text-gray-600">
                Échangez avec des milliers de développeurs passionnés
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Zap className="text-green-600" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Environnement professionnel
              </h3>
              <p className="text-sm text-gray-600">
                Un IDE moderne avec tests automatiques et feedback instantané
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-12 overflow-hidden">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold text-white mb-4">
                Environnement de code professionnel
              </h2>
              <p className="text-gray-300 mb-6">
                Codez directement dans votre navigateur avec notre éditeur puissant.
                Support de multiples langages, coloration syntaxique, et exécution en temps réel.
              </p>
              <button
                onClick={() => onNavigate('problems')}
                className="px-6 py-2.5 text-sm font-medium text-gray-900 bg-white rounded-lg hover:bg-gray-100 transition-colors"
              >
                Explorer les problèmes
              </button>
            </div>
            <div className="bg-gray-950 rounded-lg p-6 font-mono text-sm">
              <div className="text-green-400 mb-2">def solve(nums, target):</div>
              <div className="text-blue-300 ml-4 mb-2">hash_map = {}</div>
              <div className="text-blue-300 ml-4 mb-2">for i, num in enumerate(nums):</div>
              <div className="text-yellow-300 ml-8 mb-2">complement = target - num</div>
              <div className="text-yellow-300 ml-8 mb-2">if complement in hash_map:</div>
              <div className="text-pink-300 ml-12 mb-2">return [hash_map[complement], i]</div>
              <div className="text-yellow-300 ml-8">hash_map[num] = i</div>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center text-sm text-gray-600">
            © 2024 CodeArena. Tous droits réservés.
          </div>
        </div>
      </footer>
    </div>
  );
}
