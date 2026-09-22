import api, { isMockEnabled, mockDelay } from './api';
import { initialTasks } from './mockData';

let mockTasksList = [...initialTasks];

const mapTaskTypeToDjango = (tp) => {
  if (!tp) return 'to_do';
  const t = String(tp).toLowerCase();
  if (t.includes('call')) return 'call';
  if (t.includes('meet')) return 'meeting';
  if (t.includes('email') || t.includes('mail')) return 'email';
  if (t.includes('follow')) return 'follow_up';
  if (t.includes('demo')) return 'demo';
  return 'to_do';
};

const mapPriorityToDjango = (pr) => {
  if (!pr) return 'medium';
  const p = String(pr).toLowerCase();
  if (p.includes('high') || p.includes('hot')) return 'high';
  if (p.includes('med') || p.includes('warm')) return 'medium';
  if (p.includes('low') || p.includes('cold')) return 'low';
  if (p.includes('urg')) return 'urgent';
  return 'medium';
};

const mapStatusToDjango = (st) => {
  if (!st) return 'pending';
  const s = String(st).toLowerCase();
  if (s.includes('progress')) return 'in_progress';
  if (s.includes('pend')) return 'pending';
  if (s.includes('complete')) return 'completed';
  if (s.includes('cancel')) return 'cancelled';
  return 'pending';
};

const normalizeTask = (t) => {
  if (!t) return t;

  let statusDisplay = t.status || 'Pending';
  const s = String(t.status || '').toLowerCase();
  if (s === 'pending') statusDisplay = 'Pending';
  else if (s === 'in_progress') statusDisplay = 'In Progress';
  else if (s === 'completed') statusDisplay = 'Completed';
  else if (s === 'cancelled') statusDisplay = 'Cancelled';

  let typeDisplay = t.task_type_label || t.task_type || t.taskType || 'General To-Do';
  const tp = String(t.task_type || t.type || '').toLowerCase();
  if (tp === 'call') typeDisplay = 'Phone Call';
  else if (tp === 'meeting') typeDisplay = 'Meeting';
  else if (tp === 'email') typeDisplay = 'Send Email';
  else if (tp === 'follow_up') typeDisplay = 'Follow-up';
  else if (tp === 'demo') typeDisplay = 'Product Demo';

  return {
    ...t,
    id: t.id,
    title: t.title || 'Task',
    description: t.description || '',
    taskType: typeDisplay,
    type: typeDisplay,
    priority: t.priority || 'Medium',
    status: statusDisplay,
    dueDate: t.due_date ? t.due_date.split('T')[0] : (t.dueDate || ''),
    due_date: t.due_date || t.dueDate || '',
    assignedTo: t.assigned_to_name || t.assignedTo || 'Unassigned',
  };
};

const mapPayloadToBackend = (data) => {
  const payload = {
    title: data.title || 'Task Item',
    description: data.description || data.notes || '',
    task_type: mapTaskTypeToDjango(data.taskType || data.task_type || data.type),
    priority: mapPriorityToDjango(data.priority),
    status: mapStatusToDjango(data.status),
    due_date: data.dueDate || data.due_date || data.scheduledDate || null,
  };

  if (typeof data.lead === 'number') payload.lead = data.lead;
  if (typeof data.customer === 'number') payload.customer = data.customer;
  if (typeof data.opportunity === 'number') payload.opportunity = data.opportunity;

  return payload;
};

export const taskService = {
  getTasks: async ({ page = 1, limit = 10, search = '', status = '', priority = '' } = {}) => {
    if (isMockEnabled) {
      await mockDelay(null, 250);

      let filtered = [...mockTasksList].map(normalizeTask);

      if (search && search.trim()) {
        const q = search.toLowerCase();
        filtered = filtered.filter(
          (t) =>
            (t.title || '').toLowerCase().includes(q) ||
            (t.description || '').toLowerCase().includes(q)
        );
      }

      if (status && status !== 'All') {
        const s = status.toLowerCase();
        filtered = filtered.filter((t) => (t.status || '').toLowerCase().includes(s));
      }

      if (priority && priority !== 'All') {
        const p = priority.toLowerCase();
        filtered = filtered.filter((t) => (t.priority || '').toLowerCase().includes(p));
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
      if (status && status !== 'All') {
        const djangoStatus = mapStatusToDjango(status);
        if (djangoStatus) params.append('status', djangoStatus);
      }
      if (priority && priority !== 'All') {
        const djangoPriority = mapPriorityToDjango(priority);
        if (djangoPriority) params.append('priority', djangoPriority);
      }

      const res = await api.get(`/tasks/?${params.toString()}`);
      const rawList = Array.isArray(res) ? res : (res.results || res.data || []);
      const dataList = rawList.map(normalizeTask);
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
      console.warn('Task API fallback:', err);
      const normalizedMock = mockTasksList.map(normalizeTask);
      return { data: normalizedMock, results: normalizedMock, totalItems: normalizedMock.length, totalPages: 1 };
    }
  },

  createTask: async (taskData) => {
    if (isMockEnabled) {
      await mockDelay(null, 350);
      const newTask = normalizeTask({
        ...taskData,
        id: `task-${Date.now().toString().slice(-4)}`,
      });
      mockTasksList = [newTask, ...mockTasksList];
      return newTask;
    }

    const payload = mapPayloadToBackend(taskData);
    const res = await api.post('/tasks/', payload);
    const normalized = normalizeTask(res);
    mockTasksList = [normalized, ...mockTasksList];
    return normalized;
  },

  updateTask: async (id, taskData) => {
    if (isMockEnabled) {
      await mockDelay(null, 350);
      const index = mockTasksList.findIndex((t) => t.id === id);
      if (index === -1) throw new Error('Task not found.');
      const updated = normalizeTask({
        ...mockTasksList[index],
        ...taskData,
      });
      mockTasksList[index] = updated;
      return updated;
    }

    const payload = mapPayloadToBackend(taskData);
    const res = await api.patch(`/tasks/${id}/`, payload);
    const normalized = normalizeTask(res);
    const index = mockTasksList.findIndex((t) => t.id === id);
    if (index !== -1) mockTasksList[index] = normalized;
    return normalized;
  },

  toggleComplete: async (id) => {
    if (isMockEnabled) {
      await mockDelay(null, 200);
      const index = mockTasksList.findIndex((t) => t.id === id);
      if (index === -1) throw new Error('Task not found.');
      const currentStatus = mockTasksList[index].status;
      const newStatus = currentStatus === 'Completed' ? 'Pending' : 'Completed';
      mockTasksList[index] = { ...mockTasksList[index], status: newStatus };
      return mockTasksList[index];
    }

    const res = await api.post(`/tasks/${id}/complete/`);
    return normalizeTask(res);
  },

  deleteTask: async (id) => {
    if (isMockEnabled) {
      await mockDelay(null, 300);
      mockTasksList = mockTasksList.filter((t) => t.id !== id);
      return { success: true };
    }
    await api.delete(`/tasks/${id}/`);
    mockTasksList = mockTasksList.filter((t) => t.id !== id);
    return { success: true };
  },
};

export default taskService;
