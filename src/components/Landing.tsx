import { useState, useEffect } from 'react';
import { Code, Zap, Users, Trophy, Shield, Clock, LogIn, UserPlus, Terminal } from 'lucide-react';

interface LandingProps {
  onNavigate: (view: 'login' | 'signup') => void;
}

export function Landing({ onNavigate }: LandingProps) {
  const [particles, setParticles] = useState<Array<{ x: number; y: number; id: number }>>([]);

  useEffect(() => {
    const newParticles = Array.from({ length: 50 }, (_, i) => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      id: i
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 relative overflow-hidden">
      {/* Animated Network Background */}
      <div className="absolute inset-0 overflow-hidden">
        <svg className="absolute w-full h-full">
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          {particles.map((particle, idx) => {
            if (idx < particles.length - 1) {
              const next = particles[idx + 1];
              const distance = Math.sqrt(
                Math.pow(next.x - particle.x, 2) + Math.pow(next.y - particle.y, 2)
              );
              if (distance < 20) {
                return (
                  <line
                    key={`line-${particle.id}`}
                    x1={`${particle.x}%`}
                    y1={`${particle.y}%`}
                    x2={`${next.x}%`}
                    y2={`${next.y}%`}
                    stroke="rgba(59, 130, 246, 0.3)"
                    strokeWidth="1"
                    filter="url(#glow)"
                  />
                );
              }
            }
            return null;
          })}
          {particles.map((particle) => (
            <circle
              key={`dot-${particle.id}`}
              cx={`${particle.x}%`}
              cy={`${particle.y}%`}
              r="2"
              fill="#3b82f6"
              filter="url(#glow)"
            >
              <animate
                attributeName="opacity"
                values="0.3;1;0.3"
                dur={`${2 + Math.random() * 3}s`}
                repeatCount="indefinite"
              />
            </circle>
          ))}
        </svg>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 bg-slate-900/80 backdrop-blur-md border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center">
                <Terminal className="text-white" size={24} />
              </div>
              <h1 className="text-2xl font-bold text-white">CodeArena</h1>
            </div>

            <div className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-gray-300 hover:text-white transition">
                Problems
              </a>
              <a href="#challenges" className="text-gray-300 hover:text-white transition">
                Daily Challenge
              </a>
              <a href="#leaderboard" className="text-gray-300 hover:text-white transition">
                Leaderboard
              </a>
              <a href="#about" className="text-gray-300 hover:text-white transition">
                About Us
              </a>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => onNavigate('login')}
                className="px-4 py-2 border border-slate-600 text-white rounded-lg hover:bg-slate-800 transition"
              >
                <div className="flex items-center gap-2">
                  <LogIn size={18} />
                  Login
                </div>
              </button>
              <button
                onClick={() => onNavigate('signup')}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-lg hover:from-blue-700 hover:to-cyan-600 transition"
              >
                <div className="flex items-center gap-2">
                  <UserPlus size={18} />
                  Sign Up
                </div>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-32 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            CodeArena: Affrontez les Meilleurs.
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              Codez pour la Gloire.
            </span>
          </h1>

          <p className="text-xl text-gray-300 mb-10 max-w-3xl mx-auto">
            Mesurez-vous à des développeurs du monde entier, résolvez des défis complexes
            et grimpez au sommet du classement.
          </p>

          <button
            onClick={() => onNavigate('signup')}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-lg font-semibold rounded-lg hover:from-blue-700 hover:to-cyan-600 transition transform hover:scale-105 shadow-lg shadow-blue-500/50"
          >
            Rejoignez une Compétition Maintenant
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-16">Comment ça Marche</h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-xl p-8 hover:border-blue-500 transition">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center mb-6 mx-auto">
                <Clock className="text-white" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-white text-center mb-4">
                Compétitions en Temps Réel
              </h3>
              <p className="text-gray-400 text-center">
                Affrontez vos adversaires en direct avec des mises à jour de score instantanées.
              </p>
            </div>

            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-xl p-8 hover:border-blue-500 transition">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center mb-6 mx-auto">
                <Shield className="text-white" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-white text-center mb-4">
                Environnement Sécurisé (Sandbox)
              </h3>
              <p className="text-gray-400 text-center">
                Exécutez votre code de façon sécuritaire, sans craindre les interférences.
              </p>
            </div>

            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-xl p-8 hover:border-blue-500 transition">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center mb-6 mx-auto">
                <Code className="text-white" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-white text-center mb-4">
                Large Gamme de Défis
              </h3>
              <p className="text-gray-400 text-center">
                Des problèmes pour tous les niveaux, du débutant à l'expert.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Challenges Section */}
      <section id="challenges" className="relative z-10 py-20 px-4 bg-slate-900/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-16">Défis Populaires</h2>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-900/50 to-slate-900/50 backdrop-blur-sm border border-blue-500/30 rounded-xl p-6 hover:border-blue-500 transition">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-400">Scores: 1869</span>
                <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm font-medium">
                  Medium
                </span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Algorithme de Tri Quantique</h3>
              <p className="text-gray-400 text-sm mb-4">Difficulté: Moyen</p>
              <p className="text-gray-300 mb-4">Participants: 1,234</p>
              <button
                onClick={() => onNavigate('login')}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Rejoindre
              </button>
            </div>

            <div className="bg-gradient-to-br from-purple-900/50 to-slate-900/50 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6 hover:border-purple-500 transition">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-400">Scores: 1868</span>
                <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm font-medium">
                  Medium
                </span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Optimisation de Graphes Distribués</h3>
              <p className="text-gray-400 text-sm mb-4">Difficulté: Moyen</p>
              <p className="text-gray-300 mb-4">Participants: 1,234</p>
              <button
                onClick={() => onNavigate('login')}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Rejoindre
              </button>
            </div>

            <div className="bg-gradient-to-br from-cyan-900/50 to-slate-900/50 backdrop-blur-sm border border-cyan-500/30 rounded-xl p-6 hover:border-cyan-500 transition">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-400">Scores: 1869</span>
                <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm font-medium">
                  Medium
                </span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Sécurisation de Blockchain</h3>
              <p className="text-gray-400 text-sm mb-4">Difficulté: Moyen</p>
              <p className="text-gray-300 mb-4">Participants: 1,254</p>
              <button
                onClick={() => onNavigate('login')}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Rejoindre
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="leaderboard" className="relative z-10 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Trophy className="text-yellow-400 mx-auto mb-6" size={64} />
          <h2 className="text-4xl font-bold text-white mb-6">Prêt à Relever le Défi ?</h2>
          <p className="text-xl text-gray-300 mb-10">
            Rejoignez des milliers de développeurs qui s'affrontent chaque jour pour améliorer
            leurs compétences et gagner en reconnaissance.
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => onNavigate('signup')}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-lg font-semibold rounded-lg hover:from-blue-700 hover:to-cyan-600 transition transform hover:scale-105 shadow-lg shadow-blue-500/50"
            >
              <div className="flex items-center gap-2">
                <UserPlus size={20} />
                Créer un Compte
              </div>
            </button>
            <button
              onClick={() => onNavigate('login')}
              className="px-8 py-4 border-2 border-blue-500 text-white text-lg font-semibold rounded-lg hover:bg-blue-500/10 transition"
            >
              <div className="flex items-center gap-2">
                <LogIn size={20} />
                Se Connecter
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="about" className="relative z-10 border-t border-slate-700 bg-slate-900/80 backdrop-blur-md py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-gray-400">
              <span>FAQ</span>
              <span>•</span>
              <span>Termes et Conditions</span>
            </div>
            <div className="text-gray-400 text-sm">
              Copyright © 2024 CodeArena. Tous droits réservés.
            </div>
            <div className="flex items-center gap-4">
              <Users className="text-gray-400 hover:text-white cursor-pointer transition" size={20} />
              <Trophy className="text-gray-400 hover:text-white cursor-pointer transition" size={20} />
              <Code className="text-gray-400 hover:text-white cursor-pointer transition" size={20} />
              <Zap className="text-gray-400 hover:text-white cursor-pointer transition" size={20} />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
