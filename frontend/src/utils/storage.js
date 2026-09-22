/**
 * LocalStorage utility wrapper with safe error handling and JSON parsing
 */

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'apexcrm_access_token',
  REFRESH_TOKEN: 'apexcrm_refresh_token',
  USER_DATA: 'apexcrm_user_data',
  SIDEBAR_COLLAPSED: 'apexcrm_sidebar_collapsed',
};

export const storage = {
  getAccessToken: () => {
    try {
      return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN) || null;
    } catch (e) {
      console.error('Failed to read access token from localStorage', e);
      return null;
    }
  },

  setAccessToken: (token) => {
    try {
      if (token) {
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
        localStorage.setItem('access_token', token);
      } else {
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem('access_token');
      }
    } catch (e) {
      console.error('Failed to save access token to localStorage', e);
    }
  },

  getRefreshToken: () => {
    try {
      return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN) || null;
    } catch (e) {
      console.error('Failed to read refresh token from localStorage', e);
      return null;
    }
  },

  setRefreshToken: (token) => {
    try {
      if (token) {
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token);
      } else {
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      }
    } catch (e) {
      console.error('Failed to save refresh token to localStorage', e);
    }
  },

  getUser: () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.USER_DATA);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.error('Failed to parse user data from localStorage', e);
      return null;
    }
  },

  setUser: (user) => {
    try {
      if (user) {
        localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_KEYS.USER_DATA);
      }
    } catch (e) {
      console.error('Failed to save user data to localStorage', e);
    }
  },

  clearSession: () => {
    try {
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    } catch (e) {
      console.error('Failed to clear session from localStorage', e);
    }
  },

  getSidebarCollapsed: () => {
    try {
      return localStorage.getItem(STORAGE_KEYS.SIDEBAR_COLLAPSED) === 'true';
    } catch {
      return false;
    }
  },

  setSidebarCollapsed: (isCollapsed) => {
    try {
      localStorage.setItem(STORAGE_KEYS.SIDEBAR_COLLAPSED, String(isCollapsed));
    } catch (e) {
      console.error('Failed to set sidebar state', e);
    }
  },
};
