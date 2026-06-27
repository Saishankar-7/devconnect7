import React, { createContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

// Cookie helper functions
const setCookie = (name, value, days) => {
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + encodeURIComponent(value) + expires + "; path=/; SameSite=Lax";
};

const getCookie = (name) => {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length));
  }
  return null;
};

const eraseCookie = (name) => {
  document.cookie = name + "=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax";
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Setup Axios Defaults
  // Uses VITE_API_URL if deployed, otherwise falls back to localhost
  axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const userInfo = getCookie('userInfo');
    if (userInfo) {
      try {
        const parsedUser = JSON.parse(userInfo);
        setUser(parsedUser);
        axios.defaults.headers.common['Authorization'] = `Bearer ${parsedUser.token}`;
      } catch (err) {
        console.error("Failed to parse userInfo cookie:", err);
        eraseCookie('userInfo');
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      setError(null);
      
      // Explicit cleanup before new login to prevent session crossover
      eraseCookie('userInfo');
      delete axios.defaults.headers.common['Authorization'];
      
      const { data } = await axios.post('/auth/login', { email, password });
      setUser(data);
      setCookie('userInfo', JSON.stringify(data), 5); // Store for 5 days
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      return true;
    } catch (err) {
      setError(err.response && err.response.data.message ? err.response.data.message : err.message);
      return false;
    }
  }, []);

  const register = useCallback(async (userData) => {
    try {
      setError(null);
      
      // Explicit cleanup before new registration
      eraseCookie('userInfo');
      delete axios.defaults.headers.common['Authorization'];
      
      const { data } = await axios.post('/auth/register', userData);
      setUser(data);
      setCookie('userInfo', JSON.stringify(data), 5); // Store for 5 days
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      return true;
    } catch (err) {
      setError(err.response && err.response.data.message ? err.response.data.message : err.message);
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    eraseCookie('userInfo');
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  }, []);

  const updateUser = useCallback((updatedData) => {
    // Merge existing user data with updated fields (like avatarUrl) but preserve the JWT token
    setUser((prevUser) => {
      const newUser = { ...prevUser, ...updatedData };
      setCookie('userInfo', JSON.stringify(newUser), 5); // Store for 5 days
      return newUser;
    });
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout, updateUser, clearError }}>
      {children}
    </AuthContext.Provider>
  );
};
