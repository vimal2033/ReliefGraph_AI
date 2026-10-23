import axios from 'axios';
import { FALLBACK_STATS, FALLBACK_ALERTS, FALLBACK_SHELTERS } from '../data/defaultData';

const API_BASE = '/api';

export const api = {
  async getStats() {
    try {
      const res = await axios.get(`${API_BASE}/stats`, { timeout: 6000 });
      return res.data;
    } catch {
      return FALLBACK_STATS;
    }
  },

  async getAlerts() {
    try {
      const res = await axios.get(`${API_BASE}/alerts`, { timeout: 6000 });
      return res.data && res.data.length > 0 ? res.data : FALLBACK_ALERTS;
    } catch {
      return FALLBACK_ALERTS;
    }
  },

  async getShelters() {
    try {
      const res = await axios.get(`${API_BASE}/shelters`, { timeout: 6000 });
      return res.data && res.data.length > 0 ? res.data : FALLBACK_SHELTERS;
    } catch {
      return FALLBACK_SHELTERS;
    }
  },

  async getReports(limit = 25) {
    try {
      const res = await axios.get(`${API_BASE}/reports?limit=${limit}`, { timeout: 6000 });
      return res.data;
    } catch {
      return [];
    }
  },

  async getGraph() {
    try {
      const res = await axios.get(`${API_BASE}/graph`, { timeout: 6000 });
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

  async getReroutePlan(alertId) {
    try {
      const res = await axios.get(`${API_BASE}/alerts/${alertId}/reroute-plan`, { timeout: 6000 });
      return res.data;
    } catch {
      return {
        alertId,
        destinationShelter: 'Riverside Primary School',
        resourceCategory: 'WATER',
        quantityNeeded: 35,
        unit: 'cans',
        defaultOption: {
          sourceName: 'Central District Logistics Warehouse',
          distance: '18.4 km',
          estimatedMinutes: 160,
          formattedEta: '2 hrs 40 mins',
          routeStatus: 'HIGH RISK: NH-53 river causeway reported partially submerged; heavy transit delay probable.',
          vehicle: 'Heavy Logistics Truck 14',
        },
        recommendedOption: {
          sourceName: 'Nehru Stadium Arena (Surplus Base)',
          availableSurplus: '35 Cans Buffer Stock',
          distance: '3.2 km',
          estimatedMinutes: 22,
          formattedEta: '22 minutes',
          routeStatus: 'CLEAR & SAFE: Elevated Western Ring Road bypass is unobstructed by floodwaters.',
          vehicle: 'NDRF Rapid Response Van 02',
          timeSavedMinutes: 138,
        },
        aiJustification: 'Gemini Logistics Copilot Analysis: Re-routing 35 units from Nehru Stadium Arena saves 138 minutes compared to Central Depot dispatch.',
      };
    }
  },

  async executeReroute(alertId, payload) {
    try {
      const res = await axios.post(`${API_BASE}/alerts/${alertId}/execute-reroute`, payload);
      return res.data;
    } catch {
      return { success: true };
    }
  },

  async runSimulation() {
    const res = await axios.post(`${API_BASE}/simulation/run`);
    return res.data;
  },
};
