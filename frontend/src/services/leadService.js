import api, { isMockEnabled, mockDelay } from './api';
import { initialLeads } from './mockData';

let mockLeadsList = [...initialLeads];

export const getLeads = async (filters = {}) => {
    return leadService.getLeads(filters);
};

export const createLead = async (leadData) => {
    return leadService.createLead(leadData);
};

export const convertLead = async (id, conversionData) => {
    return leadService.convertLead(id, conversionData);
};

export const addLeadNote = async (id, note) => {
    return leadService.addLeadNote(id, note);
};

export const leadService = {
  getLeads: async ({ page = 1, limit = 10, search = '', status = '', priority = '', source = '' } = {}) => {
    if (isMockEnabled) {
      await mockDelay(null, 250);

      let filtered = [...mockLeadsList];

      if (search && search.trim()) {
        const q = search.toLowerCase();
        filtered = filtered.filter(
          (l) =>
            (l.name && l.name.toLowerCase().includes(q)) ||
            (l.first_name && l.first_name.toLowerCase().includes(q)) ||
            (l.last_name && l.last_name.toLowerCase().includes(q)) ||
            (l.email && l.email.toLowerCase().includes(q))
        );
      }

      if (status && status !== 'All') {
        filtered = filtered.filter((l) => (l.status || '').toLowerCase() === status.toLowerCase());
      }

      if (source && source !== 'All') {
        filtered = filtered.filter((l) => (l.source || '').toLowerCase() === source.toLowerCase());
      }

      const totalItems = filtered.length;
      const startIndex = (page - 1) * limit;
      const data = filtered.slice(startIndex, startIndex + limit);

      return {
        data,
        results: data,
        totalItems,
        page,
        limit,
        totalPages: Math.ceil(totalItems / limit),
      };
    }

    const params = new URLSearchParams();
    if (page) params.append("page", page);
    if (limit) params.append("limit", limit);
    if (search) params.append("search", search);
    if (status && status !== "All") params.append("status", status.toLowerCase());
    if (priority && priority !== "All") params.append("priority", priority.toLowerCase());
    if (source && source !== "All") params.append("source", source.toLowerCase());

    return await api.get(`/leads/?${params.toString()}`);
  },

  getLeadById: async (id) => {
    if (isMockEnabled) {
      await mockDelay(null, 200);
      const found = mockLeadsList.find((l) => l.id === id);
      if (!found) throw new Error('Lead not found.');
      return found;
    }
    return await api.get(`/leads/${id}/`);
  },

  createLead: async (leadData) => {
    if (isMockEnabled) {
      await mockDelay(null, 350);

      const newLead = {
        ...leadData,
        id: `lead-${Date.now().toString().slice(-4)}`,
        estimatedValue: Number(leadData.estimated_budget || leadData.estimatedValue) || 0,
        createdAt: new Date().toISOString(),
      };

      mockLeadsList = [newLead, ...mockLeadsList];
      return newLead;
    }

    return await api.post('/leads/', leadData);
  },

  updateLead: async (id, leadData) => {
    if (isMockEnabled) {
      await mockDelay(null, 350);

      const index = mockLeadsList.findIndex((l) => l.id === id);
      if (index === -1) throw new Error('Lead not found.');

      const updated = {
        ...mockLeadsList[index],
        ...leadData,
      };

      mockLeadsList[index] = updated;
      return updated;
    }

    return await api.patch(`/leads/${id}/`, leadData);
  },

  convertLead: async (id, conversionData) => {
    if (isMockEnabled) {
      await mockDelay(null, 300);
      const lead = mockLeadsList.find((l) => l.id === id);
      if (lead) lead.status = 'Converted';
      return { message: 'Lead converted successfully!' };
    }
    return await api.post(`/leads/${id}/convert/`, conversionData);
  },

  addLeadNote: async (id, note) => {
    if (isMockEnabled) {
      await mockDelay(null, 200);
      return { id: Date.now(), note, created_at: new Date().toISOString() };
    }
    return await api.post(`/leads/${id}/add-note/`, { note });
  },

  deleteLead: async (id) => {
    if (isMockEnabled) {
      await mockDelay(null, 300);
      mockLeadsList = mockLeadsList.filter((l) => l.id !== id);
      return { success: true };
    }
    return await api.delete(`/leads/${id}/`);
  },
};

export default leadService;
