import api from '../lib/api';

export const authService = {
  async register(userData: { username: string; email: string; password: string; full_name: string }) {
    const response = await api.post('/auth/register', userData);
    if (response.token) {
      localStorage.setItem('auth_token', response.token);
    }
    return response;
  },

  async login(email: string, password: string) {
    const response = await api.post('/auth/login', { email, password });
    if (response.token) {
      localStorage.setItem('auth_token', response.token);
    }
    return response;
  },

  async logout() {
    localStorage.removeItem('auth_token');
  },

  async getCurrentUser() {
    try {
      const user = await api.get('/auth/me');
      return user;
    } catch (error) {
      return null;
    }
  },

  async isAuthenticated() {
    return !!localStorage.getItem('auth_token');
  },
};

export const problemService = {
  async getAll(filters?: { difficulty?: string; category?: string; search?: string }) {
    const params = new URLSearchParams();
    if (filters?.difficulty) params.append('difficulty', filters.difficulty);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.search) params.append('search', filters.search);

    const queryString = params.toString();
    return api.get(`/problems${queryString ? `?${queryString}` : ''}`);
  },

  async getById(id: string) {
    return api.get(`/problems/${id}`);
  },

  async getBySlug(slug: string) {
    return api.get(`/problems/slug/${slug}`);
  },
};

export const contestService = {
  async getAll(status?: string) {
    const queryString = status ? `?status=${status}` : '';
    return api.get(`/contests${queryString}`);
  },

  async getById(id: string) {
    return api.get(`/contests/${id}`);
  },

  async joinContest(id: string) {
    return api.post(`/contests/${id}/join`);
  },

  async getParticipants(id: string) {
    return api.get(`/contests/${id}/participants`);
  },
};

export const submissionService = {
  async submit(problemId: string, code: string, language: string) {
    return api.post('/submissions', {
      problem_id: problemId,
      code,
      language,
    });
  },

  async getMySubmissions(limit = 20) {
    return api.get(`/submissions?limit=${limit}`);
  },

  async getById(id: string) {
    return api.get(`/submissions/${id}`);
  },
};

export const leaderboardService = {
  async getLeaderboard(limit = 50) {
    return api.get(`/leaderboard?limit=${limit}`);
  },
};

export const roomService = {
  async createRoom(contestId: string, name: string, maxParticipants: number = 20) {
    return api.post('/rooms', {
      contest_id: contestId,
      name,
      max_participants: maxParticipants,
    });
  },

  async joinRoom(roomCode: string) {
    return api.post('/rooms/join', { room_code: roomCode });
  },

  async getRoomById(roomId: string) {
    return api.get(`/rooms/${roomId}`);
  },

  async getActiveRooms() {
    return api.get('/rooms');
  },

  async getRoomParticipants(roomId: string) {
    return api.get(`/rooms/${roomId}/participants`);
  },

  async updateRoomStatus(roomId: string, status: 'waiting' | 'active' | 'completed') {
    return api.patch(`/rooms/${roomId}/status`, { status });
  },

  async leaveRoom(roomId: string) {
    return api.delete(`/rooms/${roomId}/leave`);
  },
};

export const chatService = {
  async sendMessage(roomId: string, message: string) {
    return api.post(`/rooms/${roomId}/chat`, { message });
  },

  async getMessages(roomId: string, limit: number = 50) {
    return api.get(`/rooms/${roomId}/chat?limit=${limit}`);
  },
};

export const codeExecutionService = {
  async executeCode(code: string, language: string, testCases: any[], problemId: string, roomId?: string) {
    return api.post('/submissions/execute', {
      code,
      language,
      test_cases: testCases,
      problem_id: problemId,
      room_id: roomId,
    });
  },
};
