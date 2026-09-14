import api, { isMockEnabled, mockDelay } from './api';
import { initialNotifications } from './mockData';

let mockNotificationsList = [...initialNotifications];

export const notificationService = {
  getNotifications: async () => {
    if (isMockEnabled) {
      await mockDelay(null, 150);
      return [...mockNotificationsList];
    }
    try {
      const res = await api.get('/notifications/');
      const list = Array.isArray(res) ? res : (res?.results || res?.data || []);
      if (!Array.isArray(list)) return [...mockNotificationsList];
      return list.map((n) => ({
        id: n.id,
        title: n.title,
        message: n.message,
        type: n.notification_type || 'system',
        read: n.is_read || n.read || false,
        is_read: n.is_read || n.read || false,
        link: n.link_url || n.link || null,
        time: n.created_at ? new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'
      }));
    } catch (e) {
      console.warn('Notification API fallback:', e);
      return [...mockNotificationsList];
    }
  },

  markAsRead: async (id) => {
    if (isMockEnabled) {
      mockNotificationsList = mockNotificationsList.map((n) =>
        n.id === id ? { ...n, read: true, is_read: true } : n
      );
      return { success: true };
    }
    try {
      return await api.post(`/notifications/${id}/mark_read/`);
    } catch (e) {
      return { success: true };
    }
  },

  markAllAsRead: async () => {
    if (isMockEnabled) {
      mockNotificationsList = mockNotificationsList.map((n) => ({ ...n, read: true, is_read: true }));
      return { success: true };
    }
    try {
      return await api.post('/notifications/mark_all_read/');
    } catch (e) {
      return { success: true };
    }
  },
};

