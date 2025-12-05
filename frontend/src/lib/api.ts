const API_URL = import.meta.env.VITE_API_URL || '/api';

const getAuthHeader = (): HeadersInit => {
  const token = localStorage.getItem('auth_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const apiRequest = async <T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
      ...options.headers,
    },
  });

  // Si le backend renvoie autre chose qu'un JSON valide
  let data: any = null;
  try {
    data = await res.json();
  } catch (e) {
    throw new Error('Invalid JSON response from server');
  }

  // Si erreur HTTP → on renvoie le message du backend
  if (!res.ok) {
    throw new Error(data?.message || data?.error || 'Request failed');
  }

  // Le backend renvoie directement les données → pas de data.success
  return data as T;
};

export const api = {
  get: <T = any>(endpoint: string) =>
    apiRequest<T>(endpoint, { method: 'GET' }),

  post: <T = any>(endpoint: string, body?: any) =>
    apiRequest<T>(endpoint, { method: 'POST', body: JSON.stringify(body) }),

  put: <T = any>(endpoint: string, body?: any) =>
    apiRequest<T>(endpoint, { method: 'PUT', body: JSON.stringify(body) }),

  patch: <T = any>(endpoint: string, body?: any) =>
    apiRequest<T>(endpoint, { method: 'PATCH', body: JSON.stringify(body) }),

  delete: <T = any>(endpoint: string) =>
    apiRequest<T>(endpoint, { method: 'DELETE' }),
};

export default api;
