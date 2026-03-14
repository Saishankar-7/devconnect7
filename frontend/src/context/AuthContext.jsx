import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Setup Axios Defaults
  // Uses VITE_API_URL if deployed, otherwise falls back to localhost
  axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const userInfo = sessionStorage.getItem('userInfo');
    if (userInfo) {
      const parsedUser = JSON.parse(userInfo);
      setUser(parsedUser);
      axios.defaults.headers.common['Authorization'] = `Bearer ${parsedUser.token}`;
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      setError(null);
      
      // Explicit cleanup before new login to prevent session crossover
      sessionStorage.removeItem('userInfo');
      delete axios.defaults.headers.common['Authorization'];
      
      const { data } = await axios.post('/auth/login', { email, password });
      setUser(data);
      sessionStorage.setItem('userInfo', JSON.stringify(data));
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      return true;
    } catch (err) {
      setError(err.response && err.response.data.message ? err.response.data.message : err.message);
      return false;
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      
      // Explicit cleanup before new registration
      sessionStorage.removeItem('userInfo');
      delete axios.defaults.headers.common['Authorization'];
      
      const { data } = await axios.post('/auth/register', userData);
      setUser(data);
      sessionStorage.setItem('userInfo', JSON.stringify(data));
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      return true;
    } catch (err) {
      setError(err.response && err.response.data.message ? err.response.data.message : err.message);
      return false;
    }
  };

  const logout = () => {
    sessionStorage.removeItem('userInfo');
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  const updateUser = (updatedData) => {
    // Merge existing user data with updated fields (like avatarUrl) but preserve the JWT token
    const newUser = { ...user, ...updatedData };
    setUser(newUser);
    sessionStorage.setItem('userInfo', JSON.stringify(newUser));
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout, updateUser, clearError }}>
      {children}
    </AuthContext.Provider>
  );
};
