import { useEffect, useState } from 'react';
import CodeEditor from '../components/CodeEditor';
import RoomChat from '../components/RoomChat';
import LiveLeaderboard from '../components/LiveLeaderboard';
import { roomService, problemService, codeExecutionService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface Problem {
  id: string;
  title: string;
  slug: string;
  description: string;
  difficulty: string;
  points: number;
}

interface CompetitionRoomPageProps {
  onNavigate: (page: string, id?: string) => void;
  roomId?: string;
}

export default function CompetitionRoomPage({ onNavigate, roomId }: CompetitionRoomPageProps) {
  const { user } = useAuth();
  const [room, setRoom] = useState<any>(null);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  const [code, setCode] = useState('# Write your solution here\n\n');
  const [executing, setExecuting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!roomId) return;
    loadRoom();
  }, [roomId]);

  useEffect(() => {
    if (!room || room.status !== 'active') return;

    const interval = setInterval(() => {
      if (room.end_time) {
        const now = new Date().getTime();
        const end = new Date(room.end_time).getTime();
        const diff = end - now;

        if (diff <= 0) {
          setTimeLeft(0);
          clearInterval(interval);
        } else {
          setTimeLeft(Math.floor(diff / 1000));
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [room]);

  const loadRoom = async () => {
    try {
      const roomData = await roomService.getRoomById(roomId!);
      setRoom(roomData);

      const allProblems = await problemService.getAll();
      setProblems(allProblems.slice(0, 5));
      if (allProblems.length > 0) {
        setSelectedProblem(allProblems[0]);
      }
    } catch (error) {
      console.error('Failed to load room:', error);
      alert('Failed to load competition room');
      onNavigate('contests');
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteCode = async () => {
    if (!selectedProblem || !code.trim()) {
      alert('Please write some code first');
      return;
    }

    setExecuting(true);
    setResult(null);

    try {
      const testCases = [
        { input: '1', expected_output: '1' },
        { input: '2', expected_output: '2' },
      ];

      const response = await codeExecutionService.executeCode(
        code,
        'python',
        testCases,
        selectedProblem.id,
        roomId
      );

      setResult(response);
    } catch (error: any) {
      setResult({
        success: false,
        error: error.message || 'Code execution failed',
      });
    } finally {
      setExecuting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleLeaveRoom = async () => {
    if (!confirm('Are you sure you want to leave this room?')) return;

    try {
      await roomService.leaveRoom(roomId!);
      onNavigate('contests');
    } catch (error) {
      console.error('Failed to leave room:', error);
      alert('Failed to leave room');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Loading competition room...</p>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Room not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {room.name}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Room Code: <span className="font-mono font-semibold">{room.room_code}</span>
              </p>
            </div>

            <div className="flex items-center space-x-4">
              {timeLeft !== null && room.status === 'active' && (
                <div className="text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Time Remaining</p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400 font-mono">
                    {formatTime(timeLeft)}
                  </p>
                </div>
              )}

              <button
                onClick={handleLeaveRoom}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
              >
                Leave Room
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <select
                  value={selectedProblem?.id || ''}
                  onChange={(e) => {
                    const problem = problems.find(p => p.id === e.target.value);
                    setSelectedProblem(problem || null);
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {problems.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} ({p.difficulty})
                    </option>
                  ))}
                </select>

                {selectedProblem && (
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    selectedProblem.difficulty === 'Facile' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                    selectedProblem.difficulty === 'Moyen' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                    'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                  }`}>
                    {selectedProblem.points} pts
                  </span>
                )}
              </div>

              {selectedProblem && (
                <div className="prose dark:prose-invert max-w-none">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    {selectedProblem.title}
                  </h2>
                  <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {selectedProblem.description}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden">
              <CodeEditor
                value={code}
                onChange={setCode}
                language="python"
                height="400px"
              />

              <div className="p-4 border-t border-gray-300 dark:border-gray-700">
                <button
                  onClick={handleExecuteCode}
                  disabled={executing}
                  className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition"
                >
                  {executing ? 'Executing...' : 'Run & Submit'}
                </button>
              </div>

              {result && (
                <div className={`p-4 border-t ${
                  result.success && result.status === 'accepted'
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                    : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                }`}>
                  <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">
                    {result.success && result.status === 'accepted' ? 'Success!' : 'Failed'}
                  </h3>
                  {result.error && (
                    <p className="text-red-600 dark:text-red-400">{result.error}</p>
                  )}
                  {result.results && (
                    <div className="space-y-2">
                      {result.results.map((test: any, index: number) => (
                        <div key={index} className="text-sm">
                          <span className={test.passed ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                            Test {index + 1}: {test.passed ? '✓ Passed' : '✗ Failed'}
                          </span>
                          {!test.passed && (
                            <p className="text-gray-600 dark:text-gray-400 ml-4">
                              Expected: {test.expected}, Got: {test.actual}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <LiveLeaderboard roomId={roomId!} />
            <div className="h-96">
              <RoomChat roomId={roomId!} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
