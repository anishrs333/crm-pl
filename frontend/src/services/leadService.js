import api from './api';

const mapLead = (l) => ({
  ...l,
  id: l.id,
  name: l.company || `${l.first_name || ''} ${l.last_name || ''}`.trim() || 'Untitled Lead',
  contactName: `${l.first_name || ''} ${l.last_name || ''}`.trim() || l.company || 'Contact',
  email: l.email || '',
  phone: l.phone || '',
  company: l.company || '',
  status: l.status ? (l.status.charAt(0).toUpperCase() + l.status.slice(1)) : 'New',
  source: l.source || 'Website',
  estimatedValue: Number(l.estimated_value || l.estimatedValue || 0),
  score: Number(l.score || 50),
  createdAt: l.created_at || new Date().toISOString(),
  assignedTo: l.assigned_to_name || 'Unassigned',
});

export const leadService = {
  getLeads: async ({ page = 1, limit = 10, search = '', status = '', source = '' } = {}) => {
    const params = { page, page_size: limit };
    if (search) params.search = search;
    if (status) params.status = status.toLowerCase();
    if (source) params.source = source;

    const response = await api.get('/leads/', { params });

    const rawList = Array.isArray(response) ? response : (response?.results || response?.data || []);
    const totalItems = response?.count ?? rawList.length;

    return {
      data: rawList.map(mapLead),
      totalItems,
      page,
      limit,
      totalPages: Math.ceil(totalItems / limit) || 1,
    };
  },

  getLeadById: async (id) => {
    const lead = await api.get(`/leads/${id}/`);
    return mapLead(lead);
  },

  createLead: async (leadData) => {
    const nameParts = (leadData.contactName || leadData.name || '').trim().split(' ');
    const firstName = leadData.first_name || nameParts[0] || 'Lead';
    const lastName = leadData.last_name || (nameParts.slice(1).join(' ') || 'Contact');

    const payload = {
      first_name: firstName,
      last_name: lastName,
      company: leadData.company || leadData.name || '',
      email: leadData.email || '',
      phone: leadData.phone || '',
      status: (leadData.status || 'new').toLowerCase(),
      source: leadData.source || 'Inquiry',
    };

    const created = await api.post('/leads/', payload);
    return mapLead(created);
  },

  updateLead: async (id, leadData) => {
    const payload = { ...leadData };
    if (payload.status) payload.status = payload.status.toLowerCase();

    const updated = await api.patch(`/leads/${id}/`, payload);
    return mapLead(updated);
  },

  deleteLead: async (id) => {
    await api.delete(`/leads/${id}/`);
    return { success: true };
  },
};
