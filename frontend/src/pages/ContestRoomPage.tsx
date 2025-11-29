import { useState, useEffect } from 'react';
import { Trophy, Clock, Code, CheckCircle, XCircle, Users } from 'lucide-react';
import Header from '../components/Header';
import { useAuth } from '../contexts/AuthContext';

interface ContestRoomPageProps {
  onNavigate: (page: string) => void;
  contestId?: string;
}

interface Problem {
  id: string;
  title: string;
  description: string;
  difficulty: 'Facile' | 'Moyen' | 'Difficile';
  points: number;
  solved?: boolean;
}

interface Submission {
  problemId: string;
  status: 'pending' | 'accepted' | 'rejected';
  points?: number;
}

export default function ContestRoomPage({ onNavigate, contestId = '2' }: ContestRoomPageProps) {
  const { user } = useAuth();
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('python');
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [totalScore, setTotalScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(7200);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const contest = {
    id: contestId,
    title: 'Weekly Challenge #47',
    description: 'Défi hebdomadaire avec 5 problèmes de difficulté croissante',
    duration: '2 heures',
    participants: 1523
  };

  const problems: Problem[] = [
    {
      id: '1',
      title: 'Somme de deux nombres',
      description: `Étant donné un tableau d'entiers nums et un entier target, retournez les indices des deux nombres tels que leur somme soit égale à target.

Vous pouvez supposer que chaque entrée aurait exactement une solution, et vous ne pouvez pas utiliser le même élément deux fois.

Exemple:
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explication: nums[0] + nums[1] == 9, donc on retourne [0, 1].

Contraintes:
- 2 <= nums.length <= 10^4
- -10^9 <= nums[i] <= 10^9
- -10^9 <= target <= 10^9`,
      difficulty: 'Facile',
      points: 100
    },
    {
      id: '2',
      title: 'Palindrome',
      description: `Déterminez si une chaîne de caractères est un palindrome, en considérant uniquement les caractères alphanumériques et en ignorant la casse.

Exemple 1:
Input: s = "A man, a plan, a canal: Panama"
Output: true
Explication: "amanaplanacanalpanama" est un palindrome.

Exemple 2:
Input: s = "race a car"
Output: false
Explication: "raceacar" n'est pas un palindrome.

Contraintes:
- 1 <= s.length <= 2 * 10^5
- s contient uniquement des caractères ASCII imprimables.`,
      difficulty: 'Facile',
      points: 150
    },
    {
      id: '3',
      title: 'Recherche binaire',
      description: `Implémentez la recherche binaire sur un tableau trié d'entiers. Retournez l'index de l'élément cible, ou -1 s'il n'est pas trouvé.

Exemple:
Input: nums = [-1,0,3,5,9,12], target = 9
Output: 4
Explication: 9 existe dans nums et son index est 4

Contraintes:
- 1 <= nums.length <= 10^4
- -10^4 < nums[i], target < 10^4
- Tous les éléments de nums sont uniques
- nums est trié par ordre croissant`,
      difficulty: 'Moyen',
      points: 200
    },
    {
      id: '4',
      title: 'Arbre binaire - Parcours en profondeur',
      description: `Étant donné la racine d'un arbre binaire, retournez le parcours en ordre (inorder traversal) de ses valeurs.

Exemple:
Input: root = [1,null,2,3]
Output: [1,3,2]

Contraintes:
- Le nombre de nœuds dans l'arbre est dans l'intervalle [0, 100]
- -100 <= Node.val <= 100`,
      difficulty: 'Moyen',
      points: 250
    },
    {
      id: '5',
      title: 'Plus longue sous-séquence commune',
      description: `Étant donné deux chaînes text1 et text2, retournez la longueur de leur plus longue sous-séquence commune. Si aucune sous-séquence commune n'existe, retournez 0.

Une sous-séquence d'une chaîne est une nouvelle chaîne générée à partir de la chaîne originale en supprimant certains caractères (éventuellement aucun) sans changer l'ordre relatif des caractères restants.

Exemple:
Input: text1 = "abcde", text2 = "ace"
Output: 3
Explication: La plus longue sous-séquence commune est "ace" de longueur 3.

Contraintes:
- 1 <= text1.length, text2.length <= 1000
- text1 et text2 contiennent uniquement des lettres minuscules anglaises.`,
      difficulty: 'Difficile',
      points: 300
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 0) {
          clearInterval(timer);
          alert('Le temps du concours est écoulé!');
          onNavigate('contests');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onNavigate]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async () => {
    if (!selectedProblem || !code.trim()) {
      alert('Veuillez écrire du code avant de soumettre!');
      return;
    }

    setIsSubmitting(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      const isAccepted = Math.random() > 0.3;

      const newSubmission: Submission = {
        problemId: selectedProblem.id,
        status: isAccepted ? 'accepted' : 'rejected',
        points: isAccepted ? selectedProblem.points : 0
      };

      setSubmissions(prev => [...prev, newSubmission]);

      if (isAccepted) {
        const newScore = totalScore + selectedProblem.points;
        setTotalScore(newScore);

        setSelectedProblem(prev => prev ? { ...prev, solved: true } : null);

        alert(`✅ Solution acceptée! +${selectedProblem.points} points\n\nVotre score total: ${newScore} points`);
      } else {
        alert('❌ Solution rejetée. Les tests ne sont pas passés. Essayez encore!');
      }

      setCode('');

    } catch (error) {
      console.error('Error submitting:', error);
      alert('Erreur lors de la soumission. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSolvedCount = () => {
    const solvedIds = new Set(
      submissions.filter(s => s.status === 'accepted').map(s => s.problemId)
    );
    return solvedIds.size;
  };

  const isProblemSolved = (problemId: string) => {
    return submissions.some(s => s.problemId === problemId && s.status === 'accepted');
  };

  const difficultyColors = {
    'Facile': 'text-green-600 bg-green-100',
    'Moyen': 'text-yellow-600 bg-yellow-100',
    'Difficile': 'text-red-600 bg-red-100'
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Connexion requise</h2>
          <p className="text-gray-600 mb-6">Vous devez être connecté pour participer à un concours.</p>
          <button
            onClick={() => onNavigate('login')}
            className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Se connecter
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentPage="contests" isAuthenticated={true} onNavigate={onNavigate} />

      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-6 shadow-lg">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Trophy size={28} />
                <h1 className="text-2xl font-bold">{contest.title}</h1>
              </div>
              <p className="text-blue-100">{contest.description}</p>
            </div>
            <div className="flex items-center gap-8">
              <div className="text-center">
                <div className="text-sm text-blue-100 mb-1">Temps restant</div>
                <div className="text-2xl font-bold flex items-center gap-2">
                  <Clock size={24} />
                  {formatTime(timeRemaining)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-blue-100 mb-1">Votre score</div>
                <div className="text-2xl font-bold">{totalScore} pts</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-blue-100 mb-1">Problèmes résolus</div>
                <div className="text-2xl font-bold">{getSolvedCount()}/{problems.length}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-4 space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Problèmes</h2>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users size={16} />
                  {contest.participants}
                </div>
              </div>
              <div className="space-y-2">
                {problems.map((problem) => (
                  <button
                    key={problem.id}
                    onClick={() => setSelectedProblem(problem)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      selectedProblem?.id === problem.id
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 mb-1">{problem.title}</h3>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${difficultyColors[problem.difficulty]}`}>
                            {problem.difficulty}
                          </span>
                          <span className="text-xs text-gray-600">{problem.points} pts</span>
                        </div>
                      </div>
                      {isProblemSolved(problem.id) && (
                        <CheckCircle className="text-green-600 flex-shrink-0" size={20} />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="col-span-8 space-y-4">
            {selectedProblem ? (
              <>
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedProblem.title}</h2>
                      <div className="flex items-center gap-3">
                        <span className={`text-sm px-3 py-1 rounded-full font-medium ${difficultyColors[selectedProblem.difficulty]}`}>
                          {selectedProblem.difficulty}
                        </span>
                        <span className="text-sm text-gray-600">{selectedProblem.points} points</span>
                      </div>
                    </div>
                    {isProblemSolved(selectedProblem.id) && (
                      <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg">
                        <CheckCircle size={20} />
                        <span className="text-sm font-medium">Résolu</span>
                      </div>
                    )}
                  </div>
                  <div className="prose max-w-none">
                    <pre className="whitespace-pre-wrap text-gray-700 text-sm leading-relaxed">
                      {selectedProblem.description}
                    </pre>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Code size={20} className="text-gray-700" />
                      <h3 className="text-lg font-semibold text-gray-900">Votre solution</h3>
                    </div>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm"
                    >
                      <option value="python">Python</option>
                      <option value="javascript">JavaScript</option>
                      <option value="java">Java</option>
                      <option value="cpp">C++</option>
                    </select>
                  </div>
                  <textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Écrivez votre code ici..."
                    className="w-full h-64 p-4 border border-gray-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
                  />
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-gray-600">
                      {submissions.filter(s => s.problemId === selectedProblem.id).length} soumission(s)
                    </div>
                    <button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'Soumission en cours...' : 'Soumettre la solution'}
                    </button>
                  </div>
                </div>

                {submissions.filter(s => s.problemId === selectedProblem.id).length > 0 && (
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Historique des soumissions</h3>
                    <div className="space-y-2">
                      {submissions
                        .filter(s => s.problemId === selectedProblem.id)
                        .reverse()
                        .map((submission, index) => (
                          <div
                            key={index}
                            className={`p-3 rounded-lg border ${
                              submission.status === 'accepted'
                                ? 'border-green-200 bg-green-50'
                                : 'border-red-200 bg-red-50'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {submission.status === 'accepted' ? (
                                  <CheckCircle className="text-green-600" size={18} />
                                ) : (
                                  <XCircle className="text-red-600" size={18} />
                                )}
                                <span className={`text-sm font-medium ${
                                  submission.status === 'accepted' ? 'text-green-700' : 'text-red-700'
                                }`}>
                                  {submission.status === 'accepted' ? 'Accepté' : 'Rejeté'}
                                </span>
                              </div>
                              {submission.status === 'accepted' && (
                                <span className="text-sm text-green-700 font-medium">
                                  +{submission.points} points
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <Code size={48} className="text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Sélectionnez un problème
                </h3>
                <p className="text-gray-600">
                  Choisissez un problème dans la liste de gauche pour commencer à coder
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
