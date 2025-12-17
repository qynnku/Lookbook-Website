// Simple API utility for JWT auth
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export function apiFetch(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {
    ...(options.headers || {}),
    Authorization: token ? `Bearer ${token}` : '',
  };
  
  // Only set Content-Type if body is not FormData
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  // Ensure paths always include backend /api prefix
  const normalizedPath = path.startsWith('/api') ? path : `/api${path.startsWith('/') ? '' : '/'}${path}`;

  return fetch(`${API_BASE_URL}${normalizedPath}`, {
    ...options,
    headers,
  });
}