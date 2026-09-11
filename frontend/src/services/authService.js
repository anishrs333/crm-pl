import api from './api';
import { storage } from '../utils/storage';

export const authService = {
  /**
   * Log in user using Django SimpleJWT token endpoint
   */
  login: async ({ username, password }) => {
    // 1. Authenticate with Django REST Framework SimpleJWT
    const tokenResponse = await api.post('/auth/token/', {
      username: username.trim(),
      password,
    });

    const accessToken = tokenResponse.access;
    const refreshToken = tokenResponse.refresh;

    if (!accessToken) {
      throw new Error('Authentication succeeded but no access token was returned.');
    }

    storage.setAccessToken(accessToken);
    if (refreshToken) {
      storage.setRefreshToken(refreshToken);
    }

    // 2. Extract user_id from JWT payload
    let userId = null;
    try {
      const payloadBase64 = accessToken.split('.')[1];
      const decodedJson = atob(payloadBase64);
      const payload = JSON.parse(decodedJson);
      userId = payload.user_id;
    } catch (err) {
      console.warn('Could not decode JWT payload:', err);
    }

    // 3. Fetch user details from Django UserViewSet
    let userDetails = null;
    try {
      if (userId) {
        userDetails = await api.get(`/users/${userId}/`);
      } else {
        const usersList = await api.get('/users/');
        const list = Array.isArray(usersList) ? usersList : (usersList?.results || []);
        userDetails = list.find((u) => u.username.toLowerCase() === username.trim().toLowerCase());
      }
    } catch (err) {
      console.warn('Could not retrieve full user profile from /users/:', err.message);
    }

    // 4. Normalize user role and profile
    const rawRole = (userDetails?.role || '').toLowerCase();
    const mappedRole = rawRole === 'manager' ? 'Manager' : 'Admin';
    const fullName = (userDetails?.first_name || userDetails?.last_name)
      ? `${userDetails.first_name || ''} ${userDetails.last_name || ''}`.trim()
      : (userDetails?.username || username.trim());

    const userProfile = {
      id: userDetails?.id || userId || 1,
      name: fullName,
      username: userDetails?.username || username.trim(),
      email: userDetails?.email || '',
      role: mappedRole,
      department: userDetails?.department || (mappedRole === 'Admin' ? 'Management' : 'Sales'),
      phone: userDetails?.phone || '',
      isActive: userDetails?.is_active ?? true,
    };

    storage.setUser(userProfile);

    return {
      accessToken,
      refreshToken,
      user: userProfile,
    };
  },

  /**
   * Log out user and clear storage
   */
  logout: async () => {
    storage.clearSession();
  },

  /**
   * Fetch current authenticated user profile
   */
  getCurrentUser: async () => {
    const cachedUser = storage.getUser();
    if (cachedUser?.id) {
      try {
        const freshUser = await api.get(`/users/${cachedUser.id}/`);
        const rawRole = (freshUser.role || '').toLowerCase();
        const mappedRole = rawRole === 'manager' ? 'Manager' : 'Admin';
        const fullName = (freshUser.first_name || freshUser.last_name)
          ? `${freshUser.first_name || ''} ${freshUser.last_name || ''}`.trim()
          : freshUser.username;

        const updatedProfile = {
          ...cachedUser,
          ...freshUser,
          name: fullName,
          role: mappedRole,
        };
        storage.setUser(updatedProfile);
        return updatedProfile;
      } catch {
        return cachedUser;
      }
    }
    return cachedUser;
  },

  /**
   * Refresh JWT token with Django SimpleJWT refresh endpoint
   */
  refreshToken: async () => {
    const refreshToken = storage.getRefreshToken();
    if (!refreshToken) throw new Error('No refresh token available');

    const response = await api.post('/auth/token/refresh/', { refresh: refreshToken });
    if (response?.access) {
      storage.setAccessToken(response.access);
      return { accessToken: response.access };
    }
    return response;
  },
};
