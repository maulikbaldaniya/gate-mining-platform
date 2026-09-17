import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const token = localStorage.getItem('gate_mining_token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await authService.getMe();
        if (res.success && res.data.user) {
          setUser(res.data.user);
          localStorage.setItem('gate_mining_user', JSON.stringify(res.data.user));
        }
      } catch (err) {
        localStorage.removeItem('gate_mining_token');
        localStorage.removeItem('gate_mining_refresh_token');
        localStorage.removeItem('gate_mining_user');
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  const login = async (email, password) => {
    const res = await authService.login(email, password);
    if (res.success) {
      localStorage.setItem('gate_mining_token', res.data.tokens.accessToken);
      localStorage.setItem('gate_mining_refresh_token', res.data.tokens.refreshToken);
      localStorage.setItem('gate_mining_user', JSON.stringify(res.data.user));
      setUser(res.data.user);
      return res.data;
    }
    throw new Error(res.message || 'Login failed');
  };

  const register = async (userData) => {
    const res = await authService.register(userData);
    if (res.success) {
      localStorage.setItem('gate_mining_token', res.data.tokens.accessToken);
      localStorage.setItem('gate_mining_refresh_token', res.data.tokens.refreshToken);
      localStorage.setItem('gate_mining_user', JSON.stringify(res.data.user));
      setUser(res.data.user);
      return res.data;
    }
    throw new Error(res.message || 'Registration failed');
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const res = await authService.getMe();
      if (res.success && res.data.user) {
        setUser(res.data.user);
        localStorage.setItem('gate_mining_user', JSON.stringify(res.data.user));
      }
    } catch (e) {
      // ignore
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
