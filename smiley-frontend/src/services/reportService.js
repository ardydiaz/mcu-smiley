import { apiRequest, buildQuery } from './api.js';

export const reportService = {
  async list(filters = {}) {
    const response = await apiRequest('/reports' + buildQuery(filters));
    return response.data;
  },
  async csv(filters = {}) {
    return apiRequest('/reports/csv' + buildQuery(filters), {
      headers: { Accept: 'text/csv' },
    });
  },
};
