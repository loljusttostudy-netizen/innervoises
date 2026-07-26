import { createContext, useState, useEffect, useContext } from 'react';
import api from './api.js';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const response = await api.get('/auth/me');
      setUser(response.data.data);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { user, accessToken } = response.data.data;
    if (accessToken) {
      localStorage.setItem('token', accessToken);
    }
    setUser(user);
    return user;
  };

  const register = async (name, email, password) => {
    await api.post('/auth/register', { name, email, password });
    return login(email, password);
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // ignore
    } finally {
      localStorage.removeItem('token');
      setUser(null);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      localStorage.setItem('token', token);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    fetchUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, register, logout, refetchUser: fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
