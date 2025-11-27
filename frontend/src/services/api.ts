const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthToken = () => {
  return localStorage.getItem('token');
};

const getHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const api = {
  async get(endpoint: string) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  },

  async post(endpoint: string, data: any) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  },

  async put(endpoint: string, data: any) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  },

  async delete(endpoint: string) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  },
};

export const authService = {
  async register(userData: { username: string; email: string; password: string; full_name: string }) {
    const response = await api.post('/auth/register', userData);
    if (response.token) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    return response;
  },

  async login(email: string, password: string) {
    const response = await api.post('/auth/login', { email, password });
    if (response.token) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    return response;
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated() {
    return !!localStorage.getItem('token');
  },
};

export const problemService = {
  async getAll(filters?: { difficulty?: string; category?: string; search?: string }) {
    const params = new URLSearchParams();
    if (filters?.difficulty) params.append('difficulty', filters.difficulty);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.search) params.append('search', filters.search);

    const query = params.toString();
    return api.get(`/problems${query ? `?${query}` : ''}`);
  },

  async getById(id: number) {
    return api.get(`/problems/${id}`);
  },

  async getBySlug(slug: string) {
    return api.get(`/problems/slug/${slug}`);
  },
};

export const contestService = {
  async getAll(status?: string) {
    return api.get(`/contests${status ? `?status=${status}` : ''}`);
  },

  async getById(id: number) {
    return api.get(`/contests/${id}`);
  },

  async joinContest(id: number) {
    return api.post(`/contests/${id}/join`, {});
  },

  async getParticipants(id: number) {
    return api.get(`/contests/${id}/participants`);
  },
};

export const submissionService = {
  async submit(problemId: number, code: string, language: string) {
    return api.post('/submissions', { problem_id: problemId, code, language });
  },

  async getMySubmissions(limit = 20) {
    return api.get(`/submissions/my-submissions?limit=${limit}`);
  },

  async getById(id: number) {
    return api.get(`/submissions/${id}`);
  },
};

export const leaderboardService = {
  async getLeaderboard(limit = 50) {
    return api.get(`/leaderboard?limit=${limit}`);
  },
};
