import api, { isMockEnabled, mockDelay } from './api';
import { initialOpportunities } from './mockData';

let mockOpportunitiesList = [...initialOpportunities];

export const opportunityService = {
  getOpportunities: async ({ page = 1, limit = 10, search = '', stage = '', assignedTo = '' } = {}) => {
    if (isMockEnabled) {
      await mockDelay(null, 250);

      let filtered = [...mockOpportunitiesList];

      if (search.trim()) {
        const q = search.toLowerCase();
        filtered = filtered.filter(
          (o) =>
            o.title.toLowerCase().includes(q) ||
            o.customerName.toLowerCase().includes(q) ||
            o.contactPerson.toLowerCase().includes(q)
        );
      }

      if (stage) {
        filtered = filtered.filter((o) => o.stage === stage);
      }

      if (assignedTo) {
        filtered = filtered.filter((o) => o.assignedTo === assignedTo);
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

    return await api.get('/opportunities', {
      params: { page, limit, search, stage, assignedTo },
    });
  },

  createOpportunity: async (oppData) => {
    if (isMockEnabled) {
      await mockDelay(null, 350);

      const newOpp = {
        ...oppData,
        id: `opp-${Date.now().toString().slice(-4)}`,
        dealValue: Number(oppData.dealValue) || 0,
        probability: Number(oppData.probability) || 50,
        status: oppData.stage === 'Closed Won' ? 'Won' : oppData.stage === 'Closed Lost' ? 'Lost' : 'Open',
      };

      mockOpportunitiesList = [newOpp, ...mockOpportunitiesList];
      return newOpp;
    }

    return await api.post('/opportunities', oppData);
  },

  updateOpportunity: async (id, oppData) => {
    if (isMockEnabled) {
      await mockDelay(null, 350);

      const index = mockOpportunitiesList.findIndex((o) => o.id === id);
      if (index === -1) throw new Error('Opportunity not found.');

      const updated = {
        ...mockOpportunitiesList[index],
        ...oppData,
        dealValue: Number(oppData.dealValue) || 0,
        probability: Number(oppData.probability) || 50,
        status: oppData.stage === 'Closed Won' ? 'Won' : oppData.stage === 'Closed Lost' ? 'Lost' : 'Open',
      };

      mockOpportunitiesList[index] = updated;
      return updated;
    }

    return await api.put(`/opportunities/${id}`, oppData);
  },

  deleteOpportunity: async (id) => {
    if (isMockEnabled) {
      await mockDelay(null, 250);
      mockOpportunitiesList = mockOpportunitiesList.filter((o) => o.id !== id);
      return { success: true };
    }
    return await api.delete(`/opportunities/${id}`);
  },
};
