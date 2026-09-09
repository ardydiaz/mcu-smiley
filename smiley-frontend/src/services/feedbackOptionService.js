import { apiRequest, buildQuery } from './api.js';

export const feedbackOptionService = {
  async list(filters = {}) {
    const response = await apiRequest('/feedback-options' + buildQuery(filters), { auth: 'none' });
    return response.data;
  },
  async listAll(filters = {}) {
    const response = await apiRequest('/feedback-options/all' + buildQuery(filters));
    return response.data;
  },
  async create(data) {
    const response = await apiRequest('/feedback-options', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data;
  },
  async update(id, data) {
    const response = await apiRequest('/feedback-options/' + id, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.data;
  },
  async deactivate(id) {
    const response = await apiRequest('/feedback-options/' + id, { method: 'DELETE' });
    return response.data;
  },
};