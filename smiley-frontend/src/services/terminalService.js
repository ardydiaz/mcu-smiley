import { apiRequest } from './api.js';

export const terminalService = {
  async list() {
    const response = await apiRequest('/terminals', { auth: 'none' });
    return response.data;
  },
  async listAll() {
    const response = await apiRequest('/terminals/all');
    return response.data;
  },
  async listByLocation(locationId) {
    const response = await apiRequest('/terminals?locationId=' + locationId, { auth: 'none' });
    return response.data;
  },
  async create(data) {
    const response = await apiRequest('/terminals', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data;
  },
  async update(id, data) {
    const response = await apiRequest('/terminals/' + id, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.data;
  },
  async deactivate(id) {
    const response = await apiRequest('/terminals/' + id, { method: 'DELETE' });
    return response.data;
  },
};
