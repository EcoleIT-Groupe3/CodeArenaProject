import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { ProblemList } from './ProblemList';
import { DailyChallenge } from './DailyChallenge';
import { Leaderboard } from './Leaderboard';
import { CodeEditor } from './CodeEditor';
import { Profile } from './Profile';
import { LogOut, Code, Zap, Users, UserCircle } from 'lucide-react';
import type { Problem } from '../lib/supabase';

type View = 'problems' | 'daily-challenge' | 'leaderboard' | 'profile';

export function Dashboard() {
  const [activeView, setActiveView] = useState<View>('problems');
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <nav className="bg-slate-900/80 backdrop-blur-sm border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <h1 className="text-2xl font-bold text-white">CodeArena</h1>

              <div className="flex gap-2">
                <button
                  onClick={() => setActiveView('problems')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                    activeView === 'problems'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-slate-800'
                  }`}
                >
                  <Code size={20} />
                  Problems
                </button>

                <button
                  onClick={() => setActiveView('daily-challenge')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                    activeView === 'daily-challenge'
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                      : 'text-gray-300 hover:bg-slate-800'
                  }`}
                >
                  <Zap size={20} />
                  Daily Challenge
                </button>

                <button
                  onClick={() => setActiveView('leaderboard')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                    activeView === 'leaderboard'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-slate-800'
                  }`}
                >
                  <Users size={20} />
                  Leaderboard
                </button>

                <button
                  onClick={() => setActiveView('profile')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                    activeView === 'profile'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-slate-800'
                  }`}
                >
                  <UserCircle size={20} />
                  Profile
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-gray-300">{user?.email}</span>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                <LogOut size={20} />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {selectedProblem ? (
          <CodeEditor
            problem={selectedProblem}
            onBack={() => setSelectedProblem(null)}
          />
        ) : (
          <>
            {activeView === 'problems' && (
              <ProblemList onSelectProblem={setSelectedProblem} />
            )}
            {activeView === 'daily-challenge' && <DailyChallenge />}
            {activeView === 'leaderboard' && <Leaderboard />}
            {activeView === 'profile' && <Profile />}
          </>
        )}
      </main>
    </div>
  );
}
