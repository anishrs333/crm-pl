import api, { isMockEnabled, mockDelay } from './api';
import { initialUsers } from './mockData';

// Keep stateful mock array for live mutations during session
let mockUsersList = [...initialUsers];

export const userService = {
  /**
   * Get paginated and filtered users
   */
  getUsers: async ({ page = 1, limit = 10, search = '', role = '', status = '' } = {}) => {
    if (isMockEnabled) {
      await mockDelay(null, 250);

      let filtered = [...mockUsersList];

      if (search.trim()) {
        const q = search.toLowerCase();
        filtered = filtered.filter(
          (u) =>
            u.name.toLowerCase().includes(q) ||
            u.email.toLowerCase().includes(q) ||
            u.username.toLowerCase().includes(q) ||
            (u.department && u.department.toLowerCase().includes(q))
        );
      }

      if (role) {
        filtered = filtered.filter((u) => u.role === role);
      }

      if (status) {
        filtered = filtered.filter((u) => u.status === status);
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

    return await api.get('/users', {
      params: { page, limit, search, role, status },
    });
  },

  /**
   * Get user by ID
   */
  getUserById: async (id) => {
    if (isMockEnabled) {
      await mockDelay(null, 200);
      const found = mockUsersList.find((u) => u.id === id);
      if (!found) throw new Error('User not found.');
      return found;
    }
    return await api.get(`/users/${id}`);
  },

  /**
   * Create new user
   */
  createUser: async (userData) => {
    if (isMockEnabled) {
      await mockDelay(null, 350);

      // Check unique username and email
      const exists = mockUsersList.some(
        (u) =>
          u.username.toLowerCase() === userData.username.toLowerCase() ||
          u.email.toLowerCase() === userData.email.toLowerCase()
      );
      if (exists) {
        throw new Error('A user with this username or email already exists.');
      }

      const newUser = {
        ...userData,
        id: `usr-${Date.now().toString().slice(-4)}`,
        createdAt: new Date().toISOString(),
        lastLogin: null,
      };

      mockUsersList = [newUser, ...mockUsersList];
      return newUser;
    }

    return await api.post('/users', userData);
  },

  /**
   * Update existing user
   */
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

    return await api.put(`/users/${id}`, userData);
  },

  /**
   * Delete user by ID
   */
  deleteUser: async (id) => {
    if (isMockEnabled) {
      await mockDelay(null, 300);
      mockUsersList = mockUsersList.filter((u) => u.id !== id);
      return { success: true, message: 'User deleted successfully.' };
    }
    return await api.delete(`/users/${id}`);
  },
};
