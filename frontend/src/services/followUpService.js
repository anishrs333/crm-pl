import api, { isMockEnabled, mockDelay } from './api';
import { initialFollowUps } from './mockData';

let mockFollowUpsList = [...initialFollowUps];

export const followUpService = {
  getFollowUps: async ({ page = 1, limit = 10, search = '', status = '', type = '', assignedTo = '' } = {}) => {
    if (isMockEnabled) {
      await mockDelay(null, 250);

      let filtered = [...mockFollowUpsList];

      if (search && search.trim()) {
        const q = search.toLowerCase();
        filtered = filtered.filter(
          (f) =>
            (f.title || '').toLowerCase().includes(q) ||
            (f.entityName || '').toLowerCase().includes(q) ||
            (f.contactPerson || '').toLowerCase().includes(q)
        );
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
      const res = await api.get('/tasks/', {
        params: { page, limit, search, status, type, assignedTo },
      });
      const dataList = Array.isArray(res) ? res : (res.results || res.data || []);
      const mapped = dataList.map((t) => ({
        id: t.id,
        title: t.title,
        type: t.task_type_label || t.task_type || 'Phone Call',
        entityName: t.customer_name || t.lead_name || 'Client Record',
        contactPerson: t.assigned_to_name || 'Assigned Rep',
        scheduledDate: t.due_date || t.created_at,
        status: t.status === 'completed' ? 'Completed' : 'Pending',
        notes: t.description || '',
      }));
      const total = res.count || mapped.length;
      return {
        data: mapped,
        results: mapped,
        totalItems: total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      };
    } catch (err) {
      console.warn('FollowUp API fallback:', err);
      return { data: mockFollowUpsList, results: mockFollowUpsList, totalItems: mockFollowUpsList.length, totalPages: 1 };
    }
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

    try {
      return await api.post('/tasks/', {
        title: followUpData.title,
        task_type: (followUpData.type || 'call').toLowerCase(),
        due_date: followUpData.scheduledDate,
        description: followUpData.notes,
      });
    } catch (err) {
      const fallback = { ...followUpData, id: `flw-${Date.now()}` };
      mockFollowUpsList = [fallback, ...mockFollowUpsList];
      return fallback;
    }
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

    try {
      return await api.patch(`/tasks/${id}/`, followUpData);
    } catch (err) {
      return { id, ...followUpData };
    }
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

    try {
      return await api.post(`/tasks/${id}/complete/`);
    } catch (err) {
      return { id, status: 'Completed' };
    }
  },

  deleteFollowUp: async (id) => {
    if (isMockEnabled) {
      await mockDelay(null, 250);
      mockFollowUpsList = mockFollowUpsList.filter((f) => f.id !== id);
      return { success: true };
    }
    try {
      return await api.delete(`/tasks/${id}/`);
    } catch (err) {
      mockFollowUpsList = mockFollowUpsList.filter((f) => f.id !== id);
      return { success: true };
    }
  },
};

export default followUpService;
