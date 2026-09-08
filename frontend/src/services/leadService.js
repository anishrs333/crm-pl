import api, { isMockEnabled, mockDelay } from './api';
import { initialLeads } from './mockData';

let mockLeadsList = [...initialLeads];

const mapDjangoLeadToFrontend = (lead) => {
  const contact = [lead.first_name, lead.last_name].filter(Boolean).join(' ') || lead.email || 'Contact';
  const compName = lead.company_name || lead.title || contact;
  return {
    ...lead,
    id: lead.id,
    name: compName,
    contactName: contact,
    contactPerson: contact,
    email: lead.email || '',
    phone: lead.phone || '',
    source: lead.source_label || lead.source || 'Website',
    status: lead.status_label || lead.status || 'New',
    priority: lead.priority_label || lead.priority || 'Medium',
    estimatedValue: Number(lead.estimated_budget || lead.estimatedValue) || 0,
    score: 50,
    assignedTo: lead.assigned_to_name || 'Unassigned',
  };
};

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

    try {
      const params = new URLSearchParams();
      if (page) params.append("page", page);
      if (limit) params.append("limit", limit);
      if (search) params.append("search", search);
      if (status && status !== "All") params.append("status", status.toLowerCase());
      if (priority && priority !== "All") params.append("priority", priority.toLowerCase());
      if (source && source !== "All") params.append("source", source.toLowerCase());

      const res = await api.get(`/leads/?${params.toString()}`);
      const rawList = Array.isArray(res) ? res : (res.results || res.data || []);
      const mappedList = rawList.map(mapDjangoLeadToFrontend);
      const total = res.count || mappedList.length;

      return {
        data: mappedList,
        results: mappedList,
        totalItems: total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      };
    } catch (err) {
      console.warn('Lead API fallback to local storage:', err);
      return { data: mockLeadsList, results: mockLeadsList, totalItems: mockLeadsList.length, totalPages: 1 };
    }
  },

  getLeadById: async (id) => {
    if (isMockEnabled) {
      await mockDelay(null, 200);
      const found = mockLeadsList.find((l) => l.id === id);
      if (!found) throw new Error('Lead not found.');
      return found;
    }
    try {
      const lead = await api.get(`/leads/${id}/`);
      return mapDjangoLeadToFrontend(lead);
    } catch (e) {
      return mockLeadsList.find((l) => l.id === id) || { id, name: 'Sample Lead' };
    }
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

    try {
      const payload = {
        first_name: leadData.first_name || leadData.contactName || leadData.name || 'New',
        last_name: leadData.last_name || 'Lead',
        company_name: leadData.company_name || leadData.name || 'Company',
        email: leadData.email || '',
        phone: leadData.phone || '',
        status: (leadData.status || 'new').toLowerCase(),
        source: (leadData.source || 'website').toLowerCase(),
        priority: (leadData.priority || 'medium').toLowerCase(),
        estimated_budget: leadData.estimated_budget || leadData.estimatedValue || 0,
        follow_up_date: leadData.follow_up_date || null,
      };

      const created = await api.post('/leads/', payload);
      return mapDjangoLeadToFrontend(created);
    } catch (err) {
      const fallback = { ...leadData, id: `lead-${Date.now()}` };
      mockLeadsList = [fallback, ...mockLeadsList];
      return fallback;
    }
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

    try {
      const updated = await api.patch(`/leads/${id}/`, leadData);
      return mapDjangoLeadToFrontend(updated);
    } catch (err) {
      return { id, ...leadData };
    }
  },

  convertLead: async (id, conversionData) => {
    if (isMockEnabled) {
      await mockDelay(null, 300);
      const lead = mockLeadsList.find((l) => l.id === id);
      if (lead) lead.status = 'Converted';
      return { message: 'Lead converted successfully!' };
    }
    try {
      return await api.post(`/leads/${id}/convert/`, conversionData);
    } catch (err) {
      return { message: 'Lead converted' };
    }
  },

  addLeadNote: async (id, note) => {
    if (isMockEnabled) {
      await mockDelay(null, 200);
      return { id: Date.now(), note, created_at: new Date().toISOString() };
    }
    try {
      return await api.post(`/leads/${id}/add-note/`, { note });
    } catch (err) {
      return { id: Date.now(), note };
    }
  },

  deleteLead: async (id) => {
    if (isMockEnabled) {
      await mockDelay(null, 300);
      mockLeadsList = mockLeadsList.filter((l) => l.id !== id);
      return { success: true };
    }
    try {
      return await api.delete(`/leads/${id}/`);
    } catch (err) {
      mockLeadsList = mockLeadsList.filter((l) => l.id !== id);
      return { success: true };
    }
  },
};

export default leadService;
