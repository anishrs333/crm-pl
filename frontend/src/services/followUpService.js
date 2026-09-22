import api, { isMockEnabled, mockDelay } from './api';
import { initialFollowUps } from './mockData';

let mockFollowUpsList = [...initialFollowUps];

const mapTypeToDjango = (tp) => {
  if (!tp) return 'call';
  const t = String(tp).toLowerCase();
  if (t.includes('call')) return 'call';
  if (t.includes('meet')) return 'meeting';
  if (t.includes('email') || t.includes('mail')) return 'email';
  if (t.includes('follow')) return 'follow_up';
  if (t.includes('demo')) return 'demo';
  return 'to_do';
};

const normalizeFollowUp = (t) => {
  if (!t) return t;

  let typeDisplay = t.type || t.task_type_label || 'Phone Call';
  const tp = String(t.task_type || t.type || '').toLowerCase();
  if (tp === 'call') typeDisplay = 'Phone Call';
  else if (tp === 'meeting') typeDisplay = 'Meeting';
  else if (tp === 'email') typeDisplay = 'Send Email';
  else if (tp === 'follow_up') typeDisplay = 'Follow-up';

  return {
    ...t,
    id: t.id,
    title: t.title || 'Follow-up Call',
    type: typeDisplay,
    entityName: t.customer_name || t.lead_name || t.entityName || 'Client Record',
    contactPerson: t.assigned_to_name || t.contactPerson || 'Assigned Rep',
    scheduledDate: t.due_date ? t.due_date.replace('T', ' ').slice(0, 16) : (t.scheduledDate || 'Sep 16, 09:57 AM'),
    status: t.status === 'completed' || t.status === 'Completed' ? 'Completed' : 'Pending',
    notes: t.description || t.notes || '',
  };
};

export const followUpService = {
  getFollowUps: async ({ page = 1, limit = 10, search = '', status = '', type = '', assignedTo = '' } = {}) => {
    if (isMockEnabled) {
      await mockDelay(null, 250);

      let filtered = [...mockFollowUpsList].map(normalizeFollowUp);

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
      const res = await api.get('/tasks/');
      const dataList = Array.isArray(res) ? res : (res.results || res.data || []);
      const mapped = dataList.map(normalizeFollowUp);
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
      const normalizedMock = mockFollowUpsList.map(normalizeFollowUp);
      return { data: normalizedMock, results: normalizedMock, totalItems: normalizedMock.length, totalPages: 1 };
    }
  },

  scheduleFollowUp: async (followUpData) => {
    if (isMockEnabled) {
      await mockDelay(null, 350);
      const newFollowUp = normalizeFollowUp({
        ...followUpData,
        id: `flw-${Date.now().toString().slice(-4)}`,
        status: followUpData.status || 'Pending',
      });
      mockFollowUpsList = [newFollowUp, ...mockFollowUpsList];
      return newFollowUp;
    }

    const payload = {
      title: followUpData.title || 'Scheduled Interaction',
      task_type: mapTypeToDjango(followUpData.type),
      due_date: followUpData.scheduledDate || null,
      description: followUpData.notes || '',
    };

    const res = await api.post('/tasks/', payload);
    const normalized = normalizeFollowUp(res);
    mockFollowUpsList = [normalized, ...mockFollowUpsList];
    return normalized;
  },

  updateFollowUp: async (id, followUpData) => {
    if (isMockEnabled) {
      await mockDelay(null, 350);
      const index = mockFollowUpsList.findIndex((f) => f.id === id);
      if (index === -1) throw new Error('Follow-up record not found.');
      const updated = normalizeFollowUp({
        ...mockFollowUpsList[index],
        ...followUpData,
      });
      mockFollowUpsList[index] = updated;
      return updated;
    }

    const payload = {
      title: followUpData.title,
      task_type: mapTypeToDjango(followUpData.type),
      due_date: followUpData.scheduledDate,
      description: followUpData.notes,
    };

    const res = await api.patch(`/tasks/${id}/`, payload);
    const normalized = normalizeFollowUp(res);
    const index = mockFollowUpsList.findIndex((f) => f.id === id);
    if (index !== -1) mockFollowUpsList[index] = normalized;
    return normalized;
  },

  toggleStatus: async (id) => {
    if (isMockEnabled) {
      await mockDelay(null, 200);
      const index = mockFollowUpsList.findIndex((f) => f.id === id);
      if (index === -1) throw new Error('Follow-up record not found.');
      const nextStatus = mockFollowUpsList[index].status === 'Completed' ? 'Pending' : 'Completed';
      mockFollowUpsList[index] = { ...mockFollowUpsList[index], status: nextStatus };
      return mockFollowUpsList[index];
    }

    const res = await api.post(`/tasks/${id}/complete/`);
    return normalizeFollowUp(res);
  },

  deleteFollowUp: async (id) => {
    if (isMockEnabled) {
      await mockDelay(null, 250);
      mockFollowUpsList = mockFollowUpsList.filter((f) => f.id !== id);
      return { success: true };
    }
    await api.delete(`/tasks/${id}/`);
    mockFollowUpsList = mockFollowUpsList.filter((f) => f.id !== id);
    return { success: true };
  },
};

export default followUpService;
