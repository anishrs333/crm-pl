import api, { isMockEnabled, mockDelay } from './api';
import { initialTasks } from './mockData';

let mockTasksList = [...initialTasks];

export const taskService = {
  getTasks: async ({ page = 1, limit = 10, search = '', status = '', priority = '' } = {}) => {
    if (isMockEnabled) {
      await mockDelay(null, 250);

      let filtered = [...mockTasksList];

      if (search.trim()) {
        const q = search.toLowerCase();
        filtered = filtered.filter(
          (t) =>
            t.title.toLowerCase().includes(q) ||
            t.description.toLowerCase().includes(q) ||
            t.assignedTo.toLowerCase().includes(q)
        );
      }

      if (status) {
        filtered = filtered.filter((t) => t.status === status);
      }

      if (priority) {
        filtered = filtered.filter((t) => t.priority === priority);
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

    return await api.get('/tasks', {
      params: { page, limit, search, status, priority },
    });
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

    return await api.post('/tasks', taskData);
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

    return await api.put(`/tasks/${id}`, taskData);
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

    return await api.patch(`/tasks/${id}/toggle`);
  },

  deleteTask: async (id) => {
    if (isMockEnabled) {
      await mockDelay(null, 300);
      mockTasksList = mockTasksList.filter((t) => t.id !== id);
      return { success: true };
    }
    return await api.delete(`/tasks/${id}`);
  },
};
