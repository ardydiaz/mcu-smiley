import { apiRequest } from './api.js';

export const ratingService = {
  async list() {
    const response = await apiRequest('/ratings');
    return response.data;
  },
};
