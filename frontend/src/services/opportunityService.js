import api from './api';

const mapOpportunity = (o) => ({
  ...o,
  id: o.id,
  title: o.title || 'Untitled Deal',
  customerName: o.customer_name || (o.customer ? `Customer #${o.customer}` : 'Prospect Account'),
  contactPerson: o.contact_person || 'Deal Lead',
  dealValue: parseFloat(o.amount || o.dealValue || 0),
  stage: o.stage ? (o.stage.charAt(0).toUpperCase() + o.stage.slice(1)) : 'Discovery',
  probability: Number(o.probability || 10),
  expectedCloseDate: o.expected_close_date || o.expectedCloseDate,
  assignedTo: o.assigned_to_name || 'Account Exec',
  createdAt: o.created_at || new Date().toISOString(),
});

export const opportunityService = {
  getOpportunities: async ({ page = 1, limit = 10, search = '', stage = '', assignedTo = '' } = {}) => {
    const params = { page, page_size: limit };
    if (search) params.search = search;
    if (stage) params.stage = stage.toLowerCase();

    const response = await api.get('/opportunities/', { params });

    const rawList = Array.isArray(response) ? response : (response?.results || response?.data || []);
    const totalItems = response?.count ?? rawList.length;

    return {
      data: rawList.map(mapOpportunity),
      totalItems,
      page,
      limit,
      totalPages: Math.ceil(totalItems / limit) || 1,
    };
  },

  createOpportunity: async (oppData) => {
    const payload = {
      title: oppData.title,
      amount: parseFloat(oppData.dealValue || oppData.amount || 0),
      stage: (oppData.stage || 'discovery').toLowerCase(),
      probability: parseInt(oppData.probability || 10, 10),
      expected_close_date: oppData.expectedCloseDate || null,
    };

    const created = await api.post('/opportunities/', payload);
    return mapOpportunity(created);
  },

  updateOpportunity: async (id, oppData) => {
    const payload = { ...oppData };
    if (oppData.dealValue !== undefined) payload.amount = parseFloat(oppData.dealValue);
    if (oppData.stage) payload.stage = oppData.stage.toLowerCase();

    const updated = await api.patch(`/opportunities/${id}/`, payload);
    return mapOpportunity(updated);
  },

  deleteOpportunity: async (id) => {
    await api.delete(`/opportunities/${id}/`);
    return { success: true };
  },
};
