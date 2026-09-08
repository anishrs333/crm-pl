import api, { isMockEnabled, mockDelay } from './api';
import { initialNotifications } from './mockData';

let mockNotificationsList = [...initialNotifications];

export const notificationService = {
  getNotifications: async () => {
    if (isMockEnabled) {
      await mockDelay(null, 150);
      return [...mockNotificationsList];
    }
    return await api.get('/notifications');
  },

  markAsRead: async (id) => {
    if (isMockEnabled) {
      mockNotificationsList = mockNotificationsList.map((n) =>
        n.id === id ? { ...n, read: true } : n
      );
      return { success: true };
    }
    return await api.patch(`/notifications/${id}/read`);
  },

  markAllAsRead: async () => {
    if (isMockEnabled) {
      mockNotificationsList = mockNotificationsList.map((n) => ({ ...n, read: true }));
      return { success: true };
    }
    return await api.post('/notifications/mark-all-read');
  },
};
