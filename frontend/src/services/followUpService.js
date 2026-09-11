import api from './api';

const mapFollowUp = (t) => ({
  id: t.id,
  title: t.title,
  entityName: t.description || t.title,
  contactPerson: 'Client Contact',
  type: (t.title || '').toLowerCase().includes('call') ? 'Call' : (t.title || '').toLowerCase().includes('email') ? 'Email' : 'Meeting',
  scheduledDate: t.due_date || t.created_at || new Date().toISOString(),
  assignedTo: t.assigned_to_name || 'Assigned Rep',
  status: (t.status || '').toLowerCase() === 'completed' ? 'Completed' : 'Pending',
});

export const followUpService = {
  getFollowUps: async ({ page = 1, limit = 10, search = '', status = '', type = '', assignedTo = '' } = {}) => {
    const params = { page, page_size: limit };
    if (search) params.search = search;
    if (status) params.status = status.toLowerCase() === 'completed' ? 'completed' : 'pending';

    const response = await api.get('/tasks/', { params });

    const rawList = Array.isArray(response) ? response : (response?.results || response?.data || []);
    const totalItems = response?.count ?? rawList.length;

    return {
      data: rawList.map(mapFollowUp),
      totalItems,
      page,
      limit,
      totalPages: Math.ceil(totalItems / limit) || 1,
    };
  },

  scheduleFollowUp: async (followUpData) => {
    const payload = {
      title: `[${followUpData.type || 'Touchpoint'}] ${followUpData.title}`,
      description: followUpData.entityName || followUpData.notes || '',
      due_date: followUpData.scheduledDate || null,
      status: 'pending',
      priority: 'medium',
    };

    const created = await api.post('/tasks/', payload);
    return mapFollowUp(created);
  },

  updateFollowUp: async (id, followUpData) => {
    const payload = {
      title: followUpData.title,
      description: followUpData.entityName || followUpData.notes,
      due_date: followUpData.scheduledDate,
      status: (followUpData.status || '').toLowerCase() === 'completed' ? 'completed' : 'pending',
    };

    const updated = await api.patch(`/tasks/${id}/`, payload);
    return mapFollowUp(updated);
  },

  toggleStatus: async (id) => {
    const current = await api.get(`/tasks/${id}/`);
    const nextStatus = current.status === 'completed' ? 'pending' : 'completed';
    const updated = await api.patch(`/tasks/${id}/`, { status: nextStatus });
    return mapFollowUp(updated);
  },

  deleteFollowUp: async (id) => {
    await api.delete(`/tasks/${id}/`);
    return { success: true };
  },
};
