import api, { isMockEnabled, mockDelay } from './api';
import { initialTasks } from './mockData';

let mockTasksList = [...initialTasks];

export const taskService = {
  getTasks: async ({ page = 1, limit = 10, search = '', status = '', priority = '' } = {}) => {
    if (isMockEnabled) {
      await mockDelay(null, 250);

      let filtered = [...mockTasksList];

      if (search && search.trim()) {
        const q = search.toLowerCase();
        filtered = filtered.filter(
          (t) =>
            (t.title || '').toLowerCase().includes(q) ||
            (t.description || '').toLowerCase().includes(q)
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
        params: { page, limit, search, status, priority },
      });
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
      console.warn('Task API fallback:', err);
      return { data: mockTasksList, results: mockTasksList, totalItems: mockTasksList.length, totalPages: 1 };
    }
  },

  createTask: async (taskData) => {
    if (isMockEnabled) {
      await mockDelay(null, 350);

      const newTask = {
        ...taskData,
        id: `task-${Date.now().toString().slice(-4)}`,
      };

      mockTasksList = [newTask, ...mockTasksList];
      return newTask;
    }

    try {
      return await api.post('/tasks/', taskData);
    } catch (err) {
      const fallback = { ...taskData, id: `task-${Date.now()}` };
      mockTasksList = [fallback, ...mockTasksList];
      return fallback;
    }
  },

  updateTask: async (id, taskData) => {
    if (isMockEnabled) {
      await mockDelay(null, 350);

      const index = mockTasksList.findIndex((t) => t.id === id);
      if (index === -1) throw new Error('Task not found.');

      const updated = {
        ...mockTasksList[index],
        ...taskData,
      };

      mockTasksList[index] = updated;
      return updated;
    }

    try {
      return await api.patch(`/tasks/${id}/`, taskData);
    } catch (err) {
      return { id, ...taskData };
    }
  },

  toggleComplete: async (id) => {
    if (isMockEnabled) {
      await mockDelay(null, 200);

      const index = mockTasksList.findIndex((t) => t.id === id);
      if (index === -1) throw new Error('Task not found.');

      const currentStatus = mockTasksList[index].status;
      const newStatus = currentStatus === 'Completed' ? 'Pending' : 'Completed';

      mockTasksList[index] = {
        ...mockTasksList[index],
        status: newStatus,
      };

      return mockTasksList[index];
    }

    try {
      return await api.post(`/tasks/${id}/complete/`);
    } catch (err) {
      return { id, status: 'completed' };
    }
  },

  deleteTask: async (id) => {
    if (isMockEnabled) {
      await mockDelay(null, 300);
      mockTasksList = mockTasksList.filter((t) => t.id !== id);
      return { success: true };
    }
    try {
      return await api.delete(`/tasks/${id}/`);
    } catch (err) {
      mockTasksList = mockTasksList.filter((t) => t.id !== id);
      return { success: true };
    }
  },
};

export default taskService;
