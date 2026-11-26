import { apiRequest, buildQuery } from './api.js';

export const auditLogService = {
  async list(filters = {}) {
    const response = await apiRequest('/audit-logs' + buildQuery(filters));
    return response.data;
  },
};
