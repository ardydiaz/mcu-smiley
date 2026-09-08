import { apiRequest, buildQuery } from './api.js';

export const voteService = {
  async create(data) {
    const response = await apiRequest('/votes', {
      auth: 'none',
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data;
  },
  async list(filters = {}) {
    const response = await apiRequest('/votes' + buildQuery(filters));
    return response.data;
  },
};
