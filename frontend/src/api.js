const rawUrl = (import.meta.env.VITE_API_URL || 'https://smartstudy-kfsj.onrender.com/api').trim().replace(/\/+$/, '');
const API_URL = rawUrl.endsWith('/api') ? rawUrl : `${rawUrl}/api`;

export async function api(path, options = {}) {
  const token = localStorage.getItem('smartstudy_token');
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Request failed');
  return data;
}
