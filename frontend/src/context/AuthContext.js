import React, { createContext, useContext, useState, useEffect } from 'react';
import {jwtDecode} from 'jwt-decode'; // Use default import without braces
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        console.log('Decoded Token:', decodedToken);
        if (decodedToken.exp * 1000 < Date.now()) {
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        } else {
          setUser(decodedToken);
        }
      } catch (error) {
        console.error('Invalid token:', error);
        setToken(null);
        setUser(null);
      }
    }
  }, [token]);

  const login = async (email, password) => {
    try {
      const response = await axios.post('http://localhost:5002/api/users/login', { email, password });
      const { token } = response.data;
      localStorage.setItem('token', token);
      setToken(token);
      const decodedToken = jwtDecode(token);
      setUser(decodedToken);
      console.log('New Token Set:', token);
    } catch (error) {
      console.error('Error during login:', error);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post('http://localhost:5002/api/users/register', userData);
      const { token } = response.data;
      localStorage.setItem('token', token);
      setToken(token);
      const decodedToken = jwtDecode(token);
      setUser(decodedToken);
      console.log('New Token Set:', token);
    } catch (error) {
      console.error('Error during registration:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
