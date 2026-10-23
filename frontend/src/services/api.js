import axios from 'axios';
import { FALLBACK_STATS, FALLBACK_ALERTS, FALLBACK_SHELTERS } from '../data/defaultData';

const API_BASE = '/api';

export const api = {
  async getStats() {
    try {
      const res = await axios.get(`${API_BASE}/stats`, { timeout: 3000 });
      return res.data;
    } catch {
      return FALLBACK_STATS;
    }
  },

  async getAlerts() {
    try {
      const res = await axios.get(`${API_BASE}/alerts`, { timeout: 3000 });
      return res.data && res.data.length > 0 ? res.data : FALLBACK_ALERTS;
    } catch {
      return FALLBACK_ALERTS;
    }
  },

  async getShelters() {
    try {
      const res = await axios.get(`${API_BASE}/shelters`, { timeout: 3000 });
      return res.data && res.data.length > 0 ? res.data : FALLBACK_SHELTERS;
    } catch {
      return FALLBACK_SHELTERS;
    }
  },

  async getReports(limit = 25) {
    try {
      const res = await axios.get(`${API_BASE}/reports?limit=${limit}`, { timeout: 3000 });
      return res.data;
    } catch {
      return [];
    }
  },

  async getGraph() {
    try {
      const res = await axios.get(`${API_BASE}/graph`, { timeout: 3000 });
      return res.data;
    } catch {
      return { nodes: [], edges: [] };
    }
  },

  async submitReport(payload) {
    const res = await axios.post(`${API_BASE}/reports`, payload);
    return res.data;
  },

  async resolveAlert(id) {
    const res = await axios.post(`${API_BASE}/alerts/${id}/resolve`);
    return res.data;
  },

  async redispatchAlert(id) {
    const res = await axios.post(`${API_BASE}/alerts/${id}/redispatch`);
    return res.data;
  },

  async runSimulation() {
    const res = await axios.post(`${API_BASE}/simulation/run`);
    return res.data;
  },
};
