import api from './api';

const mapTask = (t) => ({
  ...t,
  id: t.id,
  title: t.title,
  description: t.description || '',
  priority: t.priority ? (t.priority.charAt(0).toUpperCase() + t.priority.slice(1)) : 'Medium',
  status: t.status ? t.status.split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : 'Pending',
  dueDate: t.due_date || t.created_at,
  assignedTo: t.assigned_to_name || 'Assigned Rep',
  createdAt: t.created_at || new Date().toISOString(),
});

export const taskService = {
  getTasks: async ({ page = 1, limit = 10, search = '', status = '', priority = '' } = {}) => {
    const params = { page, page_size: limit };
    if (search) params.search = search;
    if (status) params.status = status.toLowerCase().replace(' ', '_');
    if (priority) params.priority = priority.toLowerCase();

    const response = await api.get('/tasks/', { params });

    const rawList = Array.isArray(response) ? response : (response?.results || response?.data || []);
    const totalItems = response?.count ?? rawList.length;

    return {
      data: rawList.map(mapTask),
      totalItems,
      page,
      limit,
      totalPages: Math.ceil(totalItems / limit) || 1,
    };
  },

  createTask: async (taskData) => {
    const payload = {
      title: taskData.title,
      description: taskData.description || '',
      priority: (taskData.priority || 'medium').toLowerCase(),
      status: (taskData.status || 'pending').toLowerCase().replace(' ', '_'),
      due_date: taskData.dueDate || null,
    };

    const created = await api.post('/tasks/', payload);
    return mapTask(created);
  },

  updateTask: async (id, taskData) => {
    const payload = { ...taskData };
    if (taskData.priority) payload.priority = taskData.priority.toLowerCase();
    if (taskData.status) payload.status = taskData.status.toLowerCase().replace(' ', '_');
    if (taskData.dueDate) payload.due_date = taskData.dueDate;

    const updated = await api.patch(`/tasks/${id}/`, payload);
    return mapTask(updated);
  },

  toggleComplete: async (id) => {
    // Read current status and flip
    const current = await api.get(`/tasks/${id}/`);
    const nextStatus = (current.status === 'completed') ? 'pending' : 'completed';
    const updated = await api.patch(`/tasks/${id}/`, { status: nextStatus });
    return mapTask(updated);
  },

  deleteTask: async (id) => {
    await api.delete(`/tasks/${id}/`);
    return { success: true };
  },
};
