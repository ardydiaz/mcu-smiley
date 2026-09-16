import { apiBaseUrl, apiRequest, buildQuery } from './api.js';

export const terminalService = {
  async list() {
    const response = await apiRequest('/terminals', { auth: 'none' });
    return response.data;
  },
  async listAll() {
    const response = await apiRequest('/terminals/all');
    return response.data;
  },
  async listByLocation(locationId) {
    const response = await apiRequest('/terminals?locationId=' + locationId, { auth: 'none' });
    return response.data;
  },
  async create(data) {
    const response = await apiRequest('/terminals', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data;
  },
  async update(id, data) {
    const response = await apiRequest('/terminals/' + id, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.data;
  },
  async deactivate(id) {
    const response = await apiRequest('/terminals/' + id, { method: 'DELETE' });
    return response.data;
  },
  async listAvailableForKiosk(deviceId) {
    const response = await apiRequest('/kiosk/terminals/available' + buildQuery({ deviceId }), { auth: 'none' });
    return response.data;
  },
  async assignForKiosk({ terminalCode, deviceId }) {
    const response = await apiRequest('/kiosk/terminals/assign', {
      auth: 'none',
      method: 'POST',
      body: JSON.stringify({ terminalCode, deviceId }),
    });
    return response.data;
  },
  async heartbeatForKiosk({ terminalCode, deviceId }) {
    const response = await apiRequest('/kiosk/terminals/heartbeat', {
      auth: 'none',
      method: 'POST',
      body: JSON.stringify({ terminalCode, deviceId }),
    });
    return response.data;
  },
  async releaseForKiosk({ terminalCode, deviceId }) {
    const response = await apiRequest('/kiosk/terminals/release', {
      auth: 'none',
      method: 'POST',
      body: JSON.stringify({ terminalCode, deviceId }),
    });
    return response.data;
  },
  kioskEventsUrl() {
    return apiBaseUrl + '/kiosk/terminals/events';
  },
};
