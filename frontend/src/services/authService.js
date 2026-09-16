import api, { isMockEnabled, mockDelay } from './api';
import { storage } from '../utils/storage';
import { initialUsers } from './mockData';

export const authService = {
  login: async (credentials, passwordArg) => {
    let username = typeof credentials === 'string' ? credentials : credentials?.username;
    let password = passwordArg || credentials?.password;

    if (isMockEnabled) {
      await mockDelay(null, 500);
      const normalizedUser = (username || '').trim().toLowerCase();
      const matchedUser = initialUsers.find(
        (u) =>
          u.username.toLowerCase() === normalizedUser ||
          u.email.toLowerCase() === normalizedUser
      );

      if (!matchedUser) {
        throw new Error('User not found. Please check your username and password.');
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

    // Real Django REST API Call
    const data = await api.post('/auth/login/', { username, password });
    
    // Support both Django SimpleJWT response format (access/refresh/user) and standard
    const accessToken = data.access || data.accessToken;
    const refreshToken = data.refresh || data.refreshToken;
    const user = data.user || { username };

    if (accessToken) storage.setAccessToken(accessToken);
    if (refreshToken) storage.setRefreshToken(refreshToken);
    if (user) storage.setUser(user);

    return {
      accessToken,
      refreshToken,
      user,
      ...data
    };
  },

  logout: async () => {
    try {
      if (!isMockEnabled) {
        await api.post('/auth/logout/');
      }
    } catch (e) {
      console.warn('Logout API warning:', e.message);
    } finally {
      storage.clearSession();
    }
  },

  getCurrentUser: async () => {
    if (isMockEnabled) {
      const user = storage.getUser();
      return mockDelay(user);
    }
    return await api.get('/users/me/');
  },

  refreshToken: async () => {
    const refreshToken = storage.getRefreshToken();
    if (!refreshToken) throw new Error('No refresh token available');

    if (isMockEnabled) {
      const newAccessToken = `mock_refreshed_access_${Date.now()}`;
      storage.setAccessToken(newAccessToken);
      return { accessToken: newAccessToken };
    }

    const data = await api.post('/auth/refresh/', { refresh: refreshToken });
    const accessToken = data.access || data.accessToken;
    if (accessToken) {
      storage.setAccessToken(accessToken);
    }
    return data;
  },
};

export default authService;
