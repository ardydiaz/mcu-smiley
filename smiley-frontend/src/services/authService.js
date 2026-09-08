import { apiRequest } from './api.js';

export const authService = {
  async register(data) {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  async login(data) {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  async me() {
    return apiRequest('/auth/me');
  },
};
