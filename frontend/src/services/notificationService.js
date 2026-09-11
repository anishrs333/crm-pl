import api from './api';

export const notificationService = {
  getNotifications: async () => {
    try {
      const response = await api.get('/tasks/');
      const tasks = Array.isArray(response) ? response : (response?.results || response?.data || []);

      return tasks.slice(0, 8).map((t) => ({
        id: `notif-${t.id}`,
        title: t.title,
        message: t.description || `Task priority: ${t.priority || 'standard'}`,
        time: t.due_date || t.created_at || new Date().toISOString(),
        read: false,
        type: 'task',
      }));
    } catch {
      return [];
    }
  },

  markAsRead: async () => ({ success: true }),

  markAllAsRead: async () => ({ success: true }),
};
