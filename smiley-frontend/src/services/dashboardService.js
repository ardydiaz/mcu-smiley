import { apiRequest, buildQuery } from './api.js';

export const dashboardService = {
  async get(filters = {}) {
    const response = await apiRequest('/dashboard' + buildQuery(filters));
    return response.data;
  },
};
