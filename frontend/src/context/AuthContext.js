import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode'; // Correto: Importar corretamente o jwt-decode

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = jwtDecode(token); // Correto
      setUser({ id: decoded.id, asaasCustomerId: decoded.asaasCustomerId });
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const response = await axios.post('http://localhost:5002/api/users/login', { email, password });
    const { token } = response.data;
    localStorage.setItem('token', token);
    const decoded = jwtDecode(token); // Correto
    setUser({ id: decoded.id, asaasCustomerId: decoded.asaasCustomerId });
  };

  const register = async (userData) => {
    await axios.post('http://localhost:5002/api/users/register', userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {loading ? null : children}
    </AuthContext.Provider>
  );
};

export { AuthProvider, AuthContext };
