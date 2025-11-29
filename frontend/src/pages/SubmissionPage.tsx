import { Play, ChevronDown, ArrowLeft, CheckCircle, Loader } from 'lucide-react';
import { useState, useEffect } from 'react';
import Header from '../components/Header';
import { useAuth } from '../contexts/AuthContext';
import { submissionService, problemService } from '../services/api';

interface SubmissionPageProps {
  onNavigate: (page: string) => void;
  problemSlug?: string;
}

export default function SubmissionPage({ onNavigate, problemSlug = 'two-sum' }: SubmissionPageProps) {
  const { user, refreshProfile } = useAuth();
  const [problem, setProblem] = useState<any>(null);
  const [code, setCode] = useState(`def twoSum(nums, target):
    hash_map = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in hash_map:
            return [hash_map[complement], i]
        hash_map[num] = i
    return []`);

  const [language, setLanguage] = useState('python');
  const [testResults, setTestResults] = useState<any>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      onNavigate('login');
      return;
    }
    loadProblem();
  }, [user, problemSlug]);

  const loadProblem = async () => {
    try {
      const data = await problemService.getBySlug(problemSlug);
      setProblem(data);
    } catch (error) {
      console.error('Error loading problem:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRun = () => {
    setIsSubmitted(false);
    setTestResults({
      passed: 8,
      total: 10,
      results: [
        { case: 'Test 1', status: 'passed', time: '12ms', memory: '38.2 MB' },
        { case: 'Test 2', status: 'passed', time: '15ms', memory: '38.4 MB' },
        { case: 'Test 3', status: 'failed', time: '18ms', memory: '38.6 MB', error: 'Expected [0,1] but got []' }
      ]
    });
  };

  const handleSubmit = async () => {
    if (!problem || !user) return;

    setSubmitting(true);
    try {
      const result = await submissionService.submit(problem.id, code, language);

      setIsSubmitted(true);
      setTestResults({
        status: result.status,
        execution_time: result.execution_time,
        memory_used: result.memory_used,
      });

      await refreshProfile();
    } catch (error: any) {
      console.error('Error submitting:', error);
      alert('Erreur lors de la soumission: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header currentPage="problems" onNavigate={onNavigate} />
        <div className="flex items-center justify-center h-96">
          <Loader className="animate-spin text-blue-600" size={40} />
        </div>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header currentPage="problems" onNavigate={onNavigate} />
        <div className="flex items-center justify-center h-96">
          <p className="text-gray-600">Problème non trouvé</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentPage="problems" isAuthenticated={true} onNavigate={onNavigate} />

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">{problem.title}</h2>
              <div className="flex items-center gap-2 mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  problem.difficulty === 'Facile' ? 'bg-green-100 text-green-700' :
                  problem.difficulty === 'Moyen' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {problem.difficulty}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                  {problem.category}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                  {problem.points} points
                </span>
              </div>
            </div>

            <div className="px-6 py-4 max-h-[600px] overflow-y-auto">
              <h3 className="font-semibold text-gray-900 mb-3">Description</h3>
              <div className="text-gray-700 mb-4 whitespace-pre-line">
                {problem.description}
              </div>

              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-2">Statistiques</div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-gray-700">Taux de réussite: {problem.acceptance_rate}%</span>
                  <span>•</span>
                  <span className="text-gray-700">{problem.solved_count} solutions</span>
                  <span>•</span>
                  <span className="text-gray-700">{problem.total_submissions} soumissions</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="border-b border-gray-200 px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="appearance-none bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 pr-10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600"
                    >
                      <option value="python">Python</option>
                      <option value="javascript">JavaScript</option>
                      <option value="java">Java</option>
                      <option value="cpp">C++</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleRun}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                  >
                    <Play size={16} />
                    Exécuter
                  </button>
                </div>
              </div>

              <div className="bg-gray-950 p-6">
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full h-[400px] bg-transparent text-gray-100 font-mono text-sm resize-none focus:outline-none"
                  spellCheck={false}
                />
              </div>
            </div>

            {isSubmitted ? (
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="p-8 text-center">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                    testResults?.status === 'accepted' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    <CheckCircle className={testResults?.status === 'accepted' ? 'text-green-600' : 'text-red-600'} size={32} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {testResults?.status === 'accepted' ? 'Solution acceptée !' : 'Solution rejetée'}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {testResults?.status === 'accepted'
                      ? `Votre solution a été acceptée et vous avez gagné ${problem.points} points !`
                      : 'Votre solution ne passe pas tous les tests. Réessayez !'}
                  </p>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-sm text-gray-600">Temps d'exécution</div>
                      <div className="text-2xl font-bold text-gray-900">{testResults?.execution_time}ms</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-sm text-gray-600">Mémoire utilisée</div>
                      <div className="text-2xl font-bold text-gray-900">{(testResults?.memory_used / 1000).toFixed(1)} KB</div>
                    </div>
                  </div>
                  <button
                    onClick={() => onNavigate(testResults?.status === 'accepted' ? 'profile' : 'problems')}
                    className="flex items-center gap-2 px-6 py-3 text-base font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors mx-auto"
                  >
                    <ArrowLeft size={20} />
                    {testResults?.status === 'accepted' ? 'Voir mon profil' : 'Retour aux problèmes'}
                  </button>
                </div>
              </div>
            ) : testResults ? (
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="border-b border-gray-200 px-6 py-4">
                  <h3 className="font-semibold text-gray-900">Résultats des tests</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {testResults.passed}/{testResults.total} tests réussis
                  </p>
                </div>

                <div className="p-6 space-y-3">
                  {testResults.results.map((result: any, index: number) => (
                    <div
                      key={index}
                      className={`border rounded-lg p-4 ${
                        result.status === 'passed'
                          ? 'border-green-200 bg-green-50'
                          : 'border-pink-200 bg-pink-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">{result.case}</span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            result.status === 'passed'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-pink-100 text-pink-700'
                          }`}
                        >
                          {result.status === 'passed' ? 'Réussi' : 'Échoué'}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>Temps: {result.time}</span>
                        <span>Mémoire: {result.memory}</span>
                      </div>
                      {result.error && (
                        <div className="mt-2 text-sm text-pink-700 font-mono">
                          {result.error}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-200 px-6 py-4">
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="w-full px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Soumission en cours...' : 'Soumettre la solution'}
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </main>
    </div>
  );
}
