import React, { createContext, useContext, useState, useEffect } from 'react';
import {jwtDecode} from 'jwt-decode'; // Certifique-se de usar jwtDecode e não jwtDecode

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (token) {
      try {
        const decodedToken = jwtDecode(token); // Decodificar o token corretamente
        console.log('Decoded Token:', decodedToken); // Log do token decodificado
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

  const login = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    console.log('New Token Set:', newToken); // Log do novo token definido
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
