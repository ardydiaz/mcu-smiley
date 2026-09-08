import { apiRequest } from './api.js';

export const departmentService = {
  async list() {
    const response = await apiRequest('/departments');
    return response.data;
  },
  async listAll() {
    const response = await apiRequest('/departments/all');
    return response.data;
  },
  async create(data) {
    const response = await apiRequest('/departments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data;
  },
  async update(id, data) {
    const response = await apiRequest('/departments/' + id, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.data;
  },
  async deactivate(id) {
    const response = await apiRequest('/departments/' + id, { method: 'DELETE' });
    return response.data;
  },
};
