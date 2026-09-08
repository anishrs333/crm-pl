import React, { createContext, useState, useEffect, useCallback } from 'react';
import { storage } from '../utils/storage';
import { authService } from '../services/authService';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize session from LocalStorage on mount
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const savedToken = storage.getAccessToken();
        const savedUser = storage.getUser();

        if (savedToken && savedUser) {
          setToken(savedToken);
          setUser(savedUser);
        }
      } catch (err) {
        console.error('Failed to restore authentication session:', err);
        storage.clearSession();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen for 401 Unauthorized events emitted by api.js
    const handleUnauthorized = () => {
      setUser(null);
      setToken(null);
      storage.clearSession();
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, []);

  const login = useCallback(async (username, password) => {
    setIsLoading(true);
    try {
      const response = await authService.login({ username, password });
      setUser(response.user);
      setToken(response.accessToken);
      return response;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authService.logout();
    } finally {
      setUser(null);
      setToken(null);
      storage.clearSession();
      setIsLoading(false);
    }
  }, []);

  const hasRole = useCallback(
    (allowedRoles) => {
      if (!user || !user.role) return false;
      if (!allowedRoles || allowedRoles.length === 0) return true;
      return allowedRoles.includes(user.role);
    },
    [user]
  );

  const value = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    login,
    logout,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
