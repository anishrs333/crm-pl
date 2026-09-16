import api, { isMockEnabled, mockDelay } from './api';
import { initialOpportunities } from './mockData';

let mockOpportunitiesList = [...initialOpportunities];

const mapStageToDjango = (stg) => {
  if (!stg) return '';
  const s = String(stg).toLowerCase();
  if (s.includes('qualif') || s.includes('discover')) return 'discovery';
  if (s.includes('propos')) return 'proposal';
  if (s.includes('negotia')) return 'negotiation';
  if (s.includes('won')) return 'won';
  if (s.includes('lost')) return 'lost';
  return s;
};

export const opportunityService = {
  getOpportunities: async ({ page = 1, limit = 10, search = '', stage = '', assignedTo = '' } = {}) => {
    if (isMockEnabled) {
      await mockDelay(null, 250);

      let filtered = [...mockOpportunitiesList];

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
      const dataList = Array.isArray(res) ? res : (res.results || res.data || []);
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
      return { data: mockOpportunitiesList, results: mockOpportunitiesList, totalItems: mockOpportunitiesList.length, totalPages: 1 };
    }
  },

  createOpportunity: async (oppData) => {
    if (isMockEnabled) {
      await mockDelay(null, 350);

      const newOpp = {
        ...oppData,
        id: `opp-${Date.now().toString().slice(-4)}`,
        dealValue: Number(oppData.dealValue || oppData.amount) || 0,
        probability: Number(oppData.probability) || 50,
      };

      mockOpportunitiesList = [newOpp, ...mockOpportunitiesList];
      return newOpp;
    }

    try {
      return await api.post('/opportunities/', oppData);
    } catch (err) {
      const fallback = { ...oppData, id: `opp-${Date.now()}` };
      mockOpportunitiesList = [fallback, ...mockOpportunitiesList];
      return fallback;
    }
  },

  updateOpportunity: async (id, oppData) => {
    if (isMockEnabled) {
      await mockDelay(null, 350);

      const index = mockOpportunitiesList.findIndex((o) => o.id === id);
      if (index === -1) throw new Error('Opportunity not found.');

      const updated = {
        ...mockOpportunitiesList[index],
        ...oppData,
      };

      mockOpportunitiesList[index] = updated;
      return updated;
    }

    try {
      return await api.patch(`/opportunities/${id}/`, oppData);
    } catch (err) {
      return { id, ...oppData };
    }
  },

  deleteOpportunity: async (id) => {
    if (isMockEnabled) {
      await mockDelay(null, 250);
      mockOpportunitiesList = mockOpportunitiesList.filter((o) => o.id !== id);
      return { success: true };
    }
    try {
      return await api.delete(`/opportunities/${id}/`);
    } catch (err) {
      mockOpportunitiesList = mockOpportunitiesList.filter((o) => o.id !== id);
      return { success: true };
    }
  },
};

export default opportunityService;
