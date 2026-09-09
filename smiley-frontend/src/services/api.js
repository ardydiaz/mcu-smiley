import { getToken } from '../utils/storage.js';

export const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export class ApiError extends Error {
  constructor(message, status, payload) {
    super(message);
    this.status = status;
    this.payload = payload;
  }
}

export async function apiRequest(path, options = {}) {
  const { auth = 'admin', ...fetchOptions } = options;
  const headers = new Headers(options.headers || {});
  const token = auth === 'none' ? '' : getToken();
  if (token) headers.set('Authorization', 'Bearer ' + token);
  if (fetchOptions.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');

  const response = await fetch(apiBaseUrl + path, { ...fetchOptions, headers });
  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json') ? await response.json() : await response.text();
  if (!response.ok) {
    const message = typeof payload === 'object' ? payload.message : 'Request failed';
    throw new ApiError(message, response.status, payload);
  }
  return payload;
}

export function buildQuery(params = {}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') search.set(key, value);
  });
  const query = search.toString();
  return query ? '?' + query : '';
}
