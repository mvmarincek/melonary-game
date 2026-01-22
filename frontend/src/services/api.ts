const API_URL = import.meta.env.VITE_API_URL || '/api';

async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('melonary-storage')
    ? JSON.parse(localStorage.getItem('melonary-storage')!).state?.token
    : null;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
}

export const api = {
  auth: {
    register: (data: {
      name: string;
      email: string;
      username: string;
      password: string;
      language?: string;
      x_username?: string;
      tiktok_username?: string;
    }) => fetchAPI('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
    
    login: (data: { email: string; password: string }) =>
      fetchAPI('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
    
    me: () => fetchAPI('/auth/me'),
    
    updateSettings: (data: {
      language?: string;
      sound_enabled?: boolean;
      music_volume?: number;
      sfx_volume?: number;
    }) => fetchAPI('/auth/settings', { method: 'PUT', body: JSON.stringify(data) }),
  },

  game: {
    start: () => fetchAPI('/game/start', { method: 'POST' }),
    
    kick: (data: { sessionId: string; timing: 'miss' | 'hit' | 'perfect'; enemyType?: string }) =>
      fetchAPI('/game/kick', { method: 'POST', body: JSON.stringify(data) }),
    
    end: (sessionId: string) =>
      fetchAPI('/game/end', { method: 'POST', body: JSON.stringify({ sessionId }) }),
    
    getRankingGlobal: (limit = 100) => fetchAPI(`/game/ranking/global?limit=${limit}`),
    
    getRankingWeekly: (limit = 100) => fetchAPI(`/game/ranking/weekly?limit=${limit}`),
    
    getPhases: () => fetchAPI('/game/phases'),
  },

  assets: {
    getCharacter: (phase?: number) =>
      fetchAPI(`/assets/character${phase ? `?phase=${phase}` : ''}`),
    
    getEnemy: (phase?: number) =>
      fetchAPI(`/assets/enemy${phase ? `?phase=${phase}` : ''}`),
    
    getBackground: (phase?: number) =>
      fetchAPI(`/assets/background${phase ? `?phase=${phase}` : ''}`),
    
    getAll: () => fetchAPI('/assets/all'),
  },

  admin: {
    getUsers: (page = 1, limit = 50, search?: string) =>
      fetchAPI(`/admin/users?page=${page}&limit=${limit}${search ? `&search=${search}` : ''}`),
    
    exportUsers: () =>
      fetch(`${API_URL}/admin/users/export`, {
        headers: {
          Authorization: `Bearer ${JSON.parse(localStorage.getItem('melonary-storage')!).state?.token}`,
        },
      }).then((res) => res.blob()),
    
    getStats: () => fetchAPI('/admin/stats'),
    
    getAssets: () => fetchAPI('/admin/assets'),
  },
};
