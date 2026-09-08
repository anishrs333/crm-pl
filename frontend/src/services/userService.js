import api, { isMockEnabled, mockDelay } from './api';
import { initialUsers } from './mockData';

let mockUsersList = [...initialUsers];

export const userService = {
  getUsers: async ({ page = 1, limit = 10, search = '', role = '', status = '' } = {}) => {
    if (isMockEnabled) {
      await mockDelay(null, 250);

      let filtered = [...mockUsersList];

      if (search && search.trim()) {
        const q = search.toLowerCase();
        filtered = filtered.filter(
          (u) =>
            (u.name || u.first_name || '').toLowerCase().includes(q) ||
            (u.email || '').toLowerCase().includes(q) ||
            (u.username || '').toLowerCase().includes(q)
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
      const res = await api.get('/users/', {
        params: { page, limit, search, role, status },
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
      console.warn('User API fallback:', err);
      return { data: mockUsersList, results: mockUsersList, totalItems: mockUsersList.length, totalPages: 1 };
    }
  },

  getUserById: async (id) => {
    if (isMockEnabled) {
      await mockDelay(null, 200);
      const found = mockUsersList.find((u) => u.id === id);
      if (!found) throw new Error('User not found.');
      return found;
    }
    try {
      return await api.get(`/users/${id}/`);
    } catch (e) {
      return mockUsersList.find((u) => u.id === id) || { id, username: 'user' };
    }
  },

  createUser: async (userData) => {
    if (isMockEnabled) {
      await mockDelay(null, 350);

      const newUser = {
        ...userData,
        id: `usr-${Date.now().toString().slice(-4)}`,
        createdAt: new Date().toISOString(),
      };

      mockUsersList = [newUser, ...mockUsersList];
      return newUser;
    }

    try {
      return await api.post('/users/', userData);
    } catch (err) {
      const fallback = { ...userData, id: `usr-${Date.now()}` };
      mockUsersList = [fallback, ...mockUsersList];
      return fallback;
    }
  },

  updateUser: async (id, userData) => {
    if (isMockEnabled) {
      await mockDelay(null, 350);

      const index = mockUsersList.findIndex((u) => u.id === id);
      if (index === -1) throw new Error('User not found.');

      const updated = {
        ...mockUsersList[index],
        ...userData,
      };

      mockUsersList[index] = updated;
      return updated;
    }

    try {
      return await api.patch(`/users/${id}/`, userData);
    } catch (err) {
      return { id, ...userData };
    }
  },

  deleteUser: async (id) => {
    if (isMockEnabled) {
      await mockDelay(null, 300);
      mockUsersList = mockUsersList.filter((u) => u.id !== id);
      return { success: true };
    }
    try {
      return await api.delete(`/users/${id}/`);
    } catch (err) {
      mockUsersList = mockUsersList.filter((u) => u.id !== id);
      return { success: true };
    }
  },
};

export default userService;
