import api, { isMockEnabled, mockDelay } from './api';
import { initialLeads } from './mockData';

let mockLeadsList = [...initialLeads];

export const leadService = {
  getLeads: async ({ page = 1, limit = 10, search = '', status = '', source = '' } = {}) => {
    if (isMockEnabled) {
      await mockDelay(null, 250);

      let filtered = [...mockLeadsList];

      if (search.trim()) {
        const q = search.toLowerCase();
        filtered = filtered.filter(
          (l) =>
            l.name.toLowerCase().includes(q) ||
            l.contactName.toLowerCase().includes(q) ||
            l.email.toLowerCase().includes(q)
        );
      }

      if (status) {
        filtered = filtered.filter((l) => l.status === status);
      }

      if (source) {
        filtered = filtered.filter((l) => l.source === source);
      }

      const totalItems = filtered.length;
      const startIndex = (page - 1) * limit;
      const data = filtered.slice(startIndex, startIndex + limit);

      return {
        data,
        totalItems,
        page,
        limit,
        totalPages: Math.ceil(totalItems / limit),
      };
    }

    return await api.get('/leads', {
      params: { page, limit, search, status, source },
    });
  },

  getLeadById: async (id) => {
    if (isMockEnabled) {
      await mockDelay(null, 200);
      const found = mockLeadsList.find((l) => l.id === id);
      if (!found) throw new Error('Lead not found.');
      return found;
    }
    return await api.get(`/leads/${id}`);
  },

  createLead: async (leadData) => {
    if (isMockEnabled) {
      await mockDelay(null, 350);

      const newLead = {
        ...leadData,
        id: `lead-${Date.now().toString().slice(-4)}`,
        estimatedValue: Number(leadData.estimatedValue) || 0,
        score: Number(leadData.score) || 50,
        createdAt: new Date().toISOString(),
      };

      mockLeadsList = [newLead, ...mockLeadsList];
      return newLead;
    }

    return await api.post('/leads', leadData);
  },

  updateLead: async (id, leadData) => {
    if (isMockEnabled) {
      await mockDelay(null, 350);

      const index = mockLeadsList.findIndex((l) => l.id === id);
      if (index === -1) throw new Error('Lead not found.');

      const updated = {
        ...mockLeadsList[index],
        ...leadData,
        estimatedValue: Number(leadData.estimatedValue) || 0,
        score: Number(leadData.score) || 50,
      };

      mockLeadsList[index] = updated;
      return updated;
    }

    return await api.put(`/leads/${id}`, leadData);
  },

  deleteLead: async (id) => {
    if (isMockEnabled) {
      await mockDelay(null, 300);
      mockLeadsList = mockLeadsList.filter((l) => l.id !== id);
      return { success: true };
    }
    return await api.delete(`/leads/${id}`);
  },
};
