import { apiRequest, buildQuery } from './api.js';

export const reportService = {
  async list(filters = {}) {
    const response = await apiRequest('/reports' + buildQuery(filters));
    return response.data;
  },
  csvUrl(filters = {}) {
    const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
    return base + '/reports/csv' + buildQuery(filters);
  },
};
