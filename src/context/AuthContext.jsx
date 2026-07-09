import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('immunitrack_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(Boolean(localStorage.getItem('immunitrack_token')));

  useEffect(() => {
    const token = localStorage.getItem('immunitrack_token');
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get('/auth/me')
      .then((res) => {
        setUser(res.data.user);
        localStorage.setItem('immunitrack_user', JSON.stringify(res.data.user));
      })
      .catch(() => {
        localStorage.removeItem('immunitrack_token');
        localStorage.removeItem('immunitrack_user');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const storeSession = (data) => {
    localStorage.setItem('immunitrack_token', data.token);
    localStorage.setItem('immunitrack_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.two_factor_required) {
      return res.data;
    }
    return storeSession(res.data);
  };

  const login2FA = async (userId, code) => {
    const res = await api.post('/auth/login/2fa', { userId, code });
    return storeSession(res.data);
  };

  const register = async (payload) => {
    const res = await api.post('/auth/register', payload);
    return storeSession(res.data);
  };

  const updateUser = (updatedUser) => {
    localStorage.setItem('immunitrack_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const logout = () => {
    localStorage.removeItem('immunitrack_token');
    localStorage.removeItem('immunitrack_user');
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, loading, login, login2FA, register, updateUser, logout, isAuthenticated: Boolean(user) }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
