import { apiRequest } from './api.js';

export const terminalDepartmentService = {
  async list(filters = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    const query = params.toString();
    const response = await apiRequest('/terminal-departments' + (query ? '?' + query : ''));
    return response.data;
  },
  async create(data) {
    const response = await apiRequest('/terminal-departments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data;
  },
  async update(id, data) {
    const response = await apiRequest('/terminal-departments/' + id, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.data;
  },
  async delete(id) {
    const response = await apiRequest('/terminal-departments/' + id, { method: 'DELETE' });
    return response.data;
  },
};
