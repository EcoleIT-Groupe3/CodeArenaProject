import { Play, Save, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import Header from '../components/Header';

interface SubmissionPageProps {
  onNavigate: (page: string) => void;
}

export default function SubmissionPage({ onNavigate }: SubmissionPageProps) {
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

  const handleRun = () => {
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentPage="problems" isAuthenticated={true} onNavigate={onNavigate} />

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Two Sum</h2>
              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                  Facile
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                  Tableaux
                </span>
              </div>
            </div>

            <div className="px-6 py-4 max-h-[600px] overflow-y-auto">
              <h3 className="font-semibold text-gray-900 mb-3">Description</h3>
              <p className="text-gray-700 mb-4">
                Étant donné un tableau d'entiers <code className="px-2 py-1 bg-gray-100 rounded text-sm">nums</code> et
                un entier <code className="px-2 py-1 bg-gray-100 rounded text-sm">target</code>,
                retournez les indices des deux nombres tels que leur somme est égale à <code className="px-2 py-1 bg-gray-100 rounded text-sm">target</code>.
              </p>

              <h3 className="font-semibold text-gray-900 mb-3">Exemple 1</h3>
              <div className="bg-gray-50 rounded-lg p-4 mb-4 font-mono text-sm">
                <div className="text-gray-700">
                  <span className="text-gray-600">Input:</span> nums = [2,7,11,15], target = 9
                </div>
                <div className="text-gray-700">
                  <span className="text-gray-600">Output:</span> [0,1]
                </div>
                <div className="text-gray-600 mt-2">
                  Explication: nums[0] + nums[1] = 2 + 7 = 9
                </div>
              </div>

              <h3 className="font-semibold text-gray-900 mb-3">Exemple 2</h3>
              <div className="bg-gray-50 rounded-lg p-4 mb-4 font-mono text-sm">
                <div className="text-gray-700">
                  <span className="text-gray-600">Input:</span> nums = [3,2,4], target = 6
                </div>
                <div className="text-gray-700">
                  <span className="text-gray-600">Output:</span> [1,2]
                </div>
              </div>

              <h3 className="font-semibold text-gray-900 mb-3">Contraintes</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>2 ≤ nums.length ≤ 10⁴</li>
                <li>-10⁹ ≤ nums[i] ≤ 10⁹</li>
                <li>-10⁹ ≤ target ≤ 10⁹</li>
              </ul>
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
                  <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">
                    <Save size={16} />
                    Sauvegarder
                  </button>
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

            {testResults && (
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
                  <button className="w-full px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                    Soumettre la solution
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
