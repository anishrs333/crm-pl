import api, { isMockEnabled, mockDelay } from './api';
import { storage } from '../utils/storage';
import { initialUsers } from './mockData';

export const authService = {
  /**
   * Log in user with username and password
   */
  login: async ({ username, password }) => {
    if (isMockEnabled) {
      // Realistic mock login validation
      await mockDelay(null, 500);

      // Check against mock users
      const normalizedUser = username.trim().toLowerCase();
      const matchedUser = initialUsers.find(
        (u) =>
          u.username.toLowerCase() === normalizedUser ||
          u.email.toLowerCase() === normalizedUser
      );

      // In mock mode, allow any matching user with password length >= 4
      if (!matchedUser) {
        throw new Error('User not found. Try "sarah_admin", "alex_manager", or "jessica_sales".');
      }

      if (!password || password.length < 4) {
        throw new Error('Invalid password. Must be at least 4 characters.');
      }

      const mockResponse = {
        accessToken: `mock_access_jwt_${Date.now()}_${matchedUser.id}`,
        refreshToken: `mock_refresh_jwt_${Date.now()}_${matchedUser.id}`,
        user: {
          id: matchedUser.id,
          name: matchedUser.name,
          email: matchedUser.email,
          username: matchedUser.username,
          role: matchedUser.role,
          department: matchedUser.department,
          avatar: matchedUser.avatar,
        },
      };

      storage.setAccessToken(mockResponse.accessToken);
      storage.setRefreshToken(mockResponse.refreshToken);
      storage.setUser(mockResponse.user);

      return mockResponse;
    }

    // Real REST API Call
    const response = await api.post('/auth/login', { username, password });
    if (response.accessToken) {
      storage.setAccessToken(response.accessToken);
      if (response.refreshToken) storage.setRefreshToken(response.refreshToken);
      if (response.user) storage.setUser(response.user);
    }
    return response;
  },

  /**
   * Log out user
   */
  logout: async () => {
    try {
      if (!isMockEnabled) {
        await api.post('/auth/logout');
      }
    } catch (e) {
      console.warn('Logout API warning:', e.message);
    } finally {
      storage.clearSession();
    }
  },

  /**
   * Fetch current authenticated user profile
   */
  getCurrentUser: async () => {
    if (isMockEnabled) {
      const user = storage.getUser();
      return mockDelay(user);
    }
    return await api.get('/auth/me');
  },

  /**
   * Refresh JWT token
   */
  refreshToken: async () => {
    const refreshToken = storage.getRefreshToken();
    if (!refreshToken) throw new Error('No refresh token available');

    if (isMockEnabled) {
      const newAccessToken = `mock_refreshed_access_${Date.now()}`;
      storage.setAccessToken(newAccessToken);
      return { accessToken: newAccessToken };
    }

    const response = await api.post('/auth/refresh', { refreshToken });
    if (response.accessToken) {
      storage.setAccessToken(response.accessToken);
    }
    return response;
  },
};
