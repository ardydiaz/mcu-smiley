import { apiRequest } from './api.js';

export const userTypeService = {
  async list() {
    const response = await apiRequest('/user-types');
    return response.data;
  },
};
