import api, { isMockEnabled, mockDelay } from './api';
import { initialLeads } from './mockData';

let mockLeadsList = [...initialLeads];

const mapStatusToDjango = (st) => {
  if (!st) return 'new';
  const s = String(st).toLowerCase();
  if (s.includes('new')) return 'new';
  if (s.includes('contacted')) return 'contacted';
  if (s.includes('qualified') || s.includes('proposal')) return 'qualified';
  if (s.includes('won') || s.includes('converted')) return 'converted';
  if (s.includes('lost') || s.includes('unqualified')) return 'unqualified';
  return 'new';
};

const mapSourceToDjango = (src) => {
  if (!src) return 'website';
  const s = String(src).toLowerCase();
  if (s.includes('cold')) return 'cold_call';
  if (s.includes('linkedin')) return 'linkedin';
  if (s.includes('referral')) return 'referral';
  if (s.includes('campaign')) return 'campaign';
  if (s.includes('event') || s.includes('conference')) return 'event';
  if (s.includes('website')) return 'website';
  return 'other';
};

const mapPriorityToDjango = (pr) => {
  if (!pr) return 'warm';
  const p = String(pr).toLowerCase();
  if (p.includes('hot') || p.includes('high')) return 'hot';
  if (p.includes('cold') || p.includes('low')) return 'cold';
  return 'warm';
};

const mapDjangoLeadToFrontend = (lead) => {
  if (!lead) return {};
  
  let contact = '';
  if (lead.contactName) {
    contact = lead.contactName;
  } else if (lead.contactPerson) {
    contact = lead.contactPerson;
  } else if (lead.first_name || lead.last_name) {
    contact = `${lead.first_name || ''} ${lead.last_name || ''}`.trim();
  } else if (lead.email) {
    contact = lead.email;
  } else {
    contact = 'Primary Contact';
  }

  let compName = lead.company_name || lead.name || (lead.first_name ? `${lead.first_name || ''} ${lead.last_name || ''}`.trim() : 'Lead Company');

  let statusDisplay = lead.status_label || lead.status || 'New';
  const s = String(lead.status || '').toLowerCase();
  if (s === 'new') statusDisplay = 'New';
  else if (s === 'contacted') statusDisplay = 'Contacted';
  else if (s === 'qualified') statusDisplay = 'Qualified';
  else if (s === 'unqualified') statusDisplay = 'Lost';
  else if (s === 'converted') statusDisplay = 'Won';

  let sourceDisplay = lead.source_label || lead.source || 'Website Inbound';
  const src = String(lead.source || '').toLowerCase();
  if (src === 'website') sourceDisplay = 'Website Inbound';
  else if (src === 'referral') sourceDisplay = 'Client Referral';
  else if (src === 'linkedin') sourceDisplay = 'LinkedIn Outreach';
  else if (src === 'cold_call') sourceDisplay = 'Cold Calling';
  else if (src === 'event') sourceDisplay = 'Conference / Event';

  return {
    ...lead,
    id: lead.id,
    name: compName,
    company_name: compName,
    contactName: contact,
    contactPerson: contact,
    first_name: lead.first_name || contact.split(' ')[0] || '',
    last_name: lead.last_name || contact.split(' ').slice(1).join(' ') || '',
    email: lead.email || '',
    phone: lead.phone || '',
    source: sourceDisplay,
    status: statusDisplay,
    priority: lead.priority_label || lead.priority || 'Medium',
    estimatedValue: Number(lead.estimated_budget || lead.estimatedValue) || 0,
    score: lead.score || 50,
    assignedTo: lead.assigned_to_name || lead.assignedTo || 'Unassigned',
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

      let filtered = mockLeadsList.map(mapDjangoLeadToFrontend);

      if (search && search.trim()) {
        const q = search.toLowerCase();
        filtered = filtered.filter(
          (l) =>
            (l.name && l.name.toLowerCase().includes(q)) ||
            (l.contactName && l.contactName.toLowerCase().includes(q)) ||
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
      if (status && status !== "All") params.append("status", mapStatusToDjango(status));
      if (priority && priority !== "All") params.append("priority", mapPriorityToDjango(priority));
      if (source && source !== "All") params.append("source", mapSourceToDjango(source));

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
      const mappedMock = mockLeadsList.map(mapDjangoLeadToFrontend);
      return { data: mappedMock, results: mappedMock, totalItems: mappedMock.length, totalPages: 1 };
    }
  },

  getLeadById: async (id) => {
    if (isMockEnabled) {
      await mockDelay(null, 200);
      const found = mockLeadsList.find((l) => l.id === id);
      if (!found) throw new Error('Lead not found.');
      return mapDjangoLeadToFrontend(found);
    }
    try {
      const lead = await api.get(`/leads/${id}/`);
      return mapDjangoLeadToFrontend(lead);
    } catch (e) {
      const found = mockLeadsList.find((l) => l.id === id);
      return found ? mapDjangoLeadToFrontend(found) : { id, name: 'Sample Lead' };
    }
  },

  createLead: async (leadData) => {
    const contactStr = leadData.contactName || leadData.contactPerson || leadData.name || 'Primary Contact';
    const parts = contactStr.trim().split(' ');
    const firstName = parts[0] || 'Primary';
    const lastName = parts.slice(1).join(' ') || '';

    const payload = {
      first_name: parts[0] || 'Prospect',
      last_name: parts.slice(1).join(' ') || '',
      company_name: leadData.name || leadData.company_name || 'Corporate Prospect',
      email: leadData.email || '',
      phone: leadData.phone || '',
      status: mapStatusToDjango(leadData.status),
      source: mapSourceToDjango(leadData.source),
      priority: mapPriorityToDjango(leadData.priority),
      estimated_budget: Number(leadData.estimatedValue || leadData.estimated_budget) || 0,
    };

    if (leadData.assignedToId !== undefined && leadData.assignedToId !== null && leadData.assignedToId !== 'Unassigned') {
      const parsedId = Number(leadData.assignedToId);
      if (!isNaN(parsedId) && parsedId > 0) payload.assigned_to = parsedId;
    }

    if (isMockEnabled) {
      await mockDelay(null, 350);
      const newLead = mapDjangoLeadToFrontend({
        ...payload,
        id: `lead-${Date.now().toString().slice(-4)}`,
        contactName: contactStr,
        created_at: new Date().toISOString(),
      });
      mockLeadsList = [newLead, ...mockLeadsList];
      return newLead;
    }

    const created = await api.post('/leads/', payload);
    const mapped = mapDjangoLeadToFrontend({
      ...created,
      contactName: contactStr,
    });
    mockLeadsList = [mapped, ...mockLeadsList];
    return mapped;
  },

  updateLead: async (id, leadData) => {
    const contactStr = leadData.contactName || leadData.contactPerson || '';
    const parts = contactStr.trim().split(' ');

    const payload = {};
    if (contactStr) {
      payload.first_name = parts[0] || '';
      payload.last_name = parts.slice(1).join(' ') || '';
    }
    if (leadData.name) payload.company_name = leadData.name;
    if (leadData.email !== undefined) payload.email = leadData.email;
    if (leadData.assignedToId !== undefined && leadData.assignedToId !== null && leadData.assignedToId !== 'Unassigned') {
      const parsedId = Number(leadData.assignedToId);
      if (!isNaN(parsedId) && parsedId > 0) payload.assigned_to = parsedId;
    }
    if (leadData.phone !== undefined) payload.phone = leadData.phone;
    if (leadData.status) payload.status = mapStatusToDjango(leadData.status);
    if (leadData.source) payload.source = mapSourceToDjango(leadData.source);
    if (leadData.estimatedValue !== undefined) payload.estimated_budget = Number(leadData.estimatedValue) || 0;

    if (isMockEnabled) {
      await mockDelay(null, 350);
      const index = mockLeadsList.findIndex((l) => l.id === id);
      if (index !== -1) {
        mockLeadsList[index] = { ...mockLeadsList[index], ...leadData };
      }
      return mapDjangoLeadToFrontend(mockLeadsList[index] || { id, ...leadData });
    }

    const updated = await api.patch(`/leads/${id}/`, payload);
    const mapped = mapDjangoLeadToFrontend(updated);
    const index = mockLeadsList.findIndex((l) => l.id === id);
    if (index !== -1) mockLeadsList[index] = mapped;
    return mapped;
  },

  convertLead: async (id, conversionData) => {
    if (isMockEnabled) {
      await mockDelay(null, 300);
      const lead = mockLeadsList.find((l) => l.id === id);
      if (lead) lead.status = 'Won';
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
    await api.delete(`/leads/${id}/`);
    mockLeadsList = mockLeadsList.filter((l) => l.id !== id);
    return { success: true };
  },
};

export default leadService;
