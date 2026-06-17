import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('mamacare_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(Boolean(localStorage.getItem('mamacare_token')));

  useEffect(() => {
    const token = localStorage.getItem('mamacare_token');
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get('/auth/me')
      .then((res) => {
        setUser(res.data.user);
        localStorage.setItem('mamacare_user', JSON.stringify(res.data.user));
      })
      .catch(() => {
        localStorage.removeItem('mamacare_token');
        localStorage.removeItem('mamacare_user');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const storeSession = (data) => {
    localStorage.setItem('mamacare_token', data.token);
    localStorage.setItem('mamacare_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    return storeSession(res.data);
  };

  const register = async (payload) => {
    const res = await api.post('/auth/register', payload);
    return storeSession(res.data);
  };

  const logout = () => {
    localStorage.removeItem('mamacare_token');
    localStorage.removeItem('mamacare_user');
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, loading, login, register, logout, isAuthenticated: Boolean(user) }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
