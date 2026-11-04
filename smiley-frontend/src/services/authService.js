import { apiBaseUrl, apiRequest } from './api.js';

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
  async kioskMe() {
    return apiRequest('/auth/kiosk/me', { auth: 'kiosk' });
  },
  async ssoConfig() {
    return apiRequest('/auth/sso/config', { auth: 'none' });
  },
  ssoStartUrl(returnTo = '/admin/dashboard', origin = 'admin') {
    const query = new URLSearchParams({ returnTo, origin });
    return apiBaseUrl + '/auth/sso/start?' + query.toString();
  },
  async listUsers() {
    const response = await apiRequest('/auth/users');
    return response.data;
  },
  async updateUserAccess(id, data) {
    const response = await apiRequest('/auth/users/' + id + '/access', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.data;
  },
};
