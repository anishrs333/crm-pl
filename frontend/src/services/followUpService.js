import api, { isMockEnabled, mockDelay } from './api';
import { initialFollowUps } from './mockData';

let mockFollowUpsList = [...initialFollowUps];

export const followUpService = {
  getFollowUps: async ({ page = 1, limit = 10, search = '', status = '', type = '', assignedTo = '' } = {}) => {
    if (isMockEnabled) {
      await mockDelay(null, 250);

      let filtered = [...mockFollowUpsList];

      if (search.trim()) {
        const q = search.toLowerCase();
        filtered = filtered.filter(
          (f) =>
            f.title.toLowerCase().includes(q) ||
            f.entityName.toLowerCase().includes(q) ||
            f.contactPerson.toLowerCase().includes(q)
        );
      }

      if (status) {
        filtered = filtered.filter((f) => f.status === status);
      }

      if (type) {
        filtered = filtered.filter((f) => f.type === type);
      }

      if (assignedTo) {
        filtered = filtered.filter((f) => f.assignedTo === assignedTo);
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

    return await api.get('/follow-ups', {
      params: { page, limit, search, status, type, assignedTo },
    });
  },

  scheduleFollowUp: async (followUpData) => {
    if (isMockEnabled) {
      await mockDelay(null, 350);

      const newFollowUp = {
        ...followUpData,
        id: `flw-${Date.now().toString().slice(-4)}`,
        status: followUpData.status || 'Pending',
      };

      mockFollowUpsList = [newFollowUp, ...mockFollowUpsList];
      return newFollowUp;
    }

    return await api.post('/follow-ups', followUpData);
  },

  updateFollowUp: async (id, followUpData) => {
    if (isMockEnabled) {
      await mockDelay(null, 350);

      const index = mockFollowUpsList.findIndex((f) => f.id === id);
      if (index === -1) throw new Error('Follow-up record not found.');

      const updated = {
        ...mockFollowUpsList[index],
        ...followUpData,
      };

      mockFollowUpsList[index] = updated;
      return updated;
    }

    return await api.put(`/follow-ups/${id}`, followUpData);
  },

  toggleStatus: async (id) => {
    if (isMockEnabled) {
      await mockDelay(null, 200);

      const index = mockFollowUpsList.findIndex((f) => f.id === id);
      if (index === -1) throw new Error('Follow-up record not found.');

      const nextStatus = mockFollowUpsList[index].status === 'Completed' ? 'Pending' : 'Completed';
      mockFollowUpsList[index] = {
        ...mockFollowUpsList[index],
        status: nextStatus,
      };

      return mockFollowUpsList[index];
    }

    return await api.patch(`/follow-ups/${id}/toggle`);
  },

  deleteFollowUp: async (id) => {
    if (isMockEnabled) {
      await mockDelay(null, 250);
      mockFollowUpsList = mockFollowUpsList.filter((f) => f.id !== id);
      return { success: true };
    }
    return await api.delete(`/follow-ups/${id}`);
  },
};
