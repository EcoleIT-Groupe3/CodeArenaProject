import { useEffect, useState } from 'react';
import { roomService, contestService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface Room {
  id: string;
  name: string;
  room_code: string;
  status: string;
  max_participants: number;
  contest: {
    title: string;
  };
  created_at: string;
}

interface RoomsPageProps {
  onNavigate: (page: string, id?: string) => void;
}

export default function RoomsPage({ onNavigate }: RoomsPageProps) {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [contests, setContests] = useState<any[]>([]);

  const [createForm, setCreateForm] = useState({
    contestId: '',
    name: '',
    maxParticipants: 20,
  });

  const [joinCode, setJoinCode] = useState('');

  useEffect(() => {
    if (!user) {
      onNavigate('login');
      return;
    }
    loadRooms();
    loadContests();
  }, [user]);

  const loadRooms = async () => {
    try {
      const data = await roomService.getActiveRooms();
      setRooms(data);
    } catch (error) {
      console.error('Failed to load rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadContests = async () => {
    try {
      const data = await contestService.getAll('active');
      setContests(data);
    } catch (error) {
      console.error('Failed to load contests:', error);
    }
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!createForm.contestId || !createForm.name) {
      alert('Please fill in all fields');
      return;
    }

    try {
      const room = await roomService.createRoom(
        createForm.contestId,
        createForm.name,
        createForm.maxParticipants
      );

      await roomService.joinRoom(room.room_code);
      onNavigate('competition-room', room.id);
    } catch (error: any) {
      console.error('Failed to create room:', error);
      alert(error.message || 'Failed to create room');
    }
  };

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!joinCode.trim()) {
      alert('Please enter a room code');
      return;
    }

    try {
      const room = await roomService.joinRoom(joinCode.toUpperCase());
      onNavigate('competition-room', room.id);
    } catch (error: any) {
      console.error('Failed to join room:', error);
      alert(error.message || 'Failed to join room. Please check the room code.');
    }
  };

  const handleQuickJoin = async (roomCode: string) => {
    try {
      const room = await roomService.joinRoom(roomCode);
      onNavigate('competition-room', room.id);
    } catch (error: any) {
      console.error('Failed to join room:', error);
      alert(error.message || 'Failed to join room');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Loading rooms...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Competition Rooms
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Create or join a room to compete with others in real-time
          </p>
        </div>

        <div className="flex space-x-4 mb-8">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
          >
            Create Room
          </button>
          <button
            onClick={() => setShowJoinModal(true)}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition"
          >
            Join with Code
          </button>
        </div>

        {rooms.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              No active rooms at the moment. Create one to get started!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room) => (
              <div
                key={room.id}
                className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-6 hover:shadow-lg transition"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {room.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {room.contest.title}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    room.status === 'waiting' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                    room.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                    'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                  }`}>
                    {room.status}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Room Code: <span className="font-mono font-semibold">{room.room_code}</span>
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Max Participants: {room.max_participants}
                  </p>
                </div>

                <button
                  onClick={() => handleQuickJoin(room.room_code)}
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                >
                  Join Room
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Create New Room
            </h2>

            <form onSubmit={handleCreateRoom} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Contest
                </label>
                <select
                  value={createForm.contestId}
                  onChange={(e) => setCreateForm({ ...createForm, contestId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                >
                  <option value="">Select a contest</option>
                  {contests.map((contest) => (
                    <option key={contest.id} value={contest.id}>
                      {contest.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Room Name
                </label>
                <input
                  type="text"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="My Awesome Room"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Max Participants
                </label>
                <input
                  type="number"
                  value={createForm.maxParticipants}
                  onChange={(e) => setCreateForm({ ...createForm, maxParticipants: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  min="2"
                  max="50"
                  required
                />
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showJoinModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Join Room
            </h2>

            <form onSubmit={handleJoinRoom} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Room Code
                </label>
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-lg text-center"
                  placeholder="ABC123"
                  maxLength={6}
                  required
                />
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowJoinModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
                >
                  Join
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
