import api, { isMockEnabled, mockDelay } from './api';
import { initialOpportunities } from './mockData';

let mockOpportunitiesList = [...initialOpportunities];

const mapStageToDjango = (stg) => {
  if (!stg) return 'discovery';
  const s = String(stg).toLowerCase();
  if (s.includes('qualif') || s.includes('discover')) return 'discovery';
  if (s.includes('propos')) return 'proposal';
  if (s.includes('negotia')) return 'negotiation';
  if (s.includes('won')) return 'won';
  if (s.includes('lost')) return 'lost';
  return 'discovery';
};

const normalizeOpportunity = (o) => {
  if (!o) return o;
  
  let stageDisplay = o.stage_label || o.stage || 'Proposal Presented';
  const s = String(o.stage || '').toLowerCase();
  if (s === 'discovery') stageDisplay = 'Qualification';
  else if (s === 'proposal') stageDisplay = 'Proposal Presented';
  else if (s === 'negotiation') stageDisplay = 'In Negotiation';
  else if (s === 'won') stageDisplay = 'Closed Won';
  else if (s === 'lost') stageDisplay = 'Closed Lost';

  const amountVal = Number(o.amount ?? o.dealValue ?? 0);

  return {
    ...o,
    id: o.id,
    title: o.title || 'New Deal',
    customerName: o.customer_name || o.customerName || (o.customer_details ? o.customer_details.name : 'Client'),
    contactPerson: o.contact_person || o.contactPerson || 'Primary Contact',
    stage: stageDisplay,
    dealValue: amountVal,
    amount: amountVal,
    probability: Number(o.probability ?? 50),
    expectedCloseDate: o.expected_close_date || o.expectedCloseDate || '',
    assignedTo: o.assigned_to_name || o.assignedTo || 'Unassigned',
    notes: o.lost_reason || o.notes || '',
  };
};

const mapPayloadToBackend = (data) => {
  const payload = {
    title: data.title || 'Sales Opportunity',
    amount: parseFloat(data.dealValue || data.amount) || 0,
    stage: mapStageToDjango(data.stage),
    probability: parseInt(data.probability) || 50,
    expected_close_date: data.expectedCloseDate || data.expected_close_date || null,
  };

  if (typeof data.customer === 'number') payload.customer = data.customer;
  if (typeof data.lead === 'number') payload.lead = data.lead;

  return payload;
};

export const opportunityService = {
  getOpportunities: async ({ page = 1, limit = 10, search = '', stage = '', assignedTo = '' } = {}) => {
    if (isMockEnabled) {
      await mockDelay(null, 250);

      let filtered = [...mockOpportunitiesList].map(normalizeOpportunity);

      if (search && search.trim()) {
        const q = search.toLowerCase();
        filtered = filtered.filter(
          (o) =>
            (o.title || o.name || '').toLowerCase().includes(q) ||
            (o.customerName || '').toLowerCase().includes(q) ||
            (o.contactPerson || '').toLowerCase().includes(q)
        );
      }

      if (stage && stage !== 'All') {
        const s = stage.toLowerCase();
        filtered = filtered.filter((o) => (o.stage || '').toLowerCase().includes(s));
      }

      if (assignedTo && assignedTo !== 'All') {
        const a = assignedTo.toLowerCase();
        filtered = filtered.filter((o) => (o.assignedTo || o.assigned_to_name || '').toLowerCase().includes(a));
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
      if (page) params.append('page', page);
      if (limit) params.append('limit', limit);
      if (search) params.append('search', search);
      if (stage && stage !== 'All') {
        const djangoStage = mapStageToDjango(stage);
        if (djangoStage) params.append('stage', djangoStage);
      }

      const res = await api.get(`/opportunities/?${params.toString()}`);
      const rawList = Array.isArray(res) ? res : (res.results || res.data || []);
      const dataList = rawList.map(normalizeOpportunity);
      const total = res.count || dataList.length;
      return {
        data: dataList,
        results: dataList,
        totalItems: total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      };
    } catch (err) {
      console.warn('Opportunity API fallback to local storage:', err);
      const normalizedMock = mockOpportunitiesList.map(normalizeOpportunity);
      return { data: normalizedMock, results: normalizedMock, totalItems: normalizedMock.length, totalPages: 1 };
    }
  },

  getOpportunityById: async (id) => {
    if (isMockEnabled) {
      await mockDelay(null, 200);
      const found = mockOpportunitiesList.find((o) => o.id === id);
      if (!found) throw new Error('Opportunity not found.');
      return normalizeOpportunity(found);
    }
    try {
      const res = await api.get(`/opportunities/${id}/`);
      return normalizeOpportunity(res);
    } catch (e) {
      return normalizeOpportunity(mockOpportunitiesList.find((o) => o.id === id) || { id, title: 'Sample Deal' });
    }
  },

  createOpportunity: async (oppData) => {
    if (isMockEnabled) {
      await mockDelay(null, 350);
      const newOpp = normalizeOpportunity({
        ...oppData,
        id: `opp-${Date.now().toString().slice(-4)}`,
      });
      mockOpportunitiesList = [newOpp, ...mockOpportunitiesList];
      return newOpp;
    }

    const payload = mapPayloadToBackend(oppData);
    const res = await api.post('/opportunities/', payload);
    const normalized = normalizeOpportunity(res);
    mockOpportunitiesList = [normalized, ...mockOpportunitiesList];
    return normalized;
  },

  updateOpportunity: async (id, oppData) => {
    if (isMockEnabled) {
      await mockDelay(null, 350);
      const index = mockOpportunitiesList.findIndex((o) => o.id === id);
      if (index === -1) throw new Error('Opportunity not found.');
      const updated = normalizeOpportunity({
        ...mockOpportunitiesList[index],
        ...oppData,
      });
      mockOpportunitiesList[index] = updated;
      return updated;
    }

    const payload = mapPayloadToBackend(oppData);
    const res = await api.patch(`/opportunities/${id}/`, payload);
    const normalized = normalizeOpportunity(res);
    const index = mockOpportunitiesList.findIndex((o) => o.id === id);
    if (index !== -1) mockOpportunitiesList[index] = normalized;
    return normalized;
  },

  deleteOpportunity: async (id) => {
    if (isMockEnabled) {
      await mockDelay(null, 250);
      mockOpportunitiesList = mockOpportunitiesList.filter((o) => o.id !== id);
      return { success: true };
    }
    await api.delete(`/opportunities/${id}/`);
    mockOpportunitiesList = mockOpportunitiesList.filter((o) => o.id !== id);
    return { success: true };
  },
};

export default opportunityService;
