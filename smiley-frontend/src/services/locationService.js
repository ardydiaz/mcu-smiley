import { apiRequest } from './api.js';

export const locationService = {
  async list() {
    const response = await apiRequest('/locations');
    return response.data;
  },
  async listAll() {
    const response = await apiRequest('/locations/all');
    return response.data;
  },
  async create(data) {
    const response = await apiRequest('/locations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data;
  },
  async update(id, data) {
    const response = await apiRequest('/locations/' + id, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.data;
  },
  async deactivate(id) {
    const response = await apiRequest('/locations/' + id, { method: 'DELETE' });
    return response.data;
  },
};
