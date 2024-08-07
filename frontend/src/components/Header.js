import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import '../styles/Header.css';

const Header = () => {
  const { user, logout } = useAuth();
  console.log("User in Header:", user); // Log do usuário no Header

  return (
    <header className="header">
      <div className="logo">
        <Link to="/">
          <img src="/logo.png" alt="Logo" className="logo-image" />
        </Link>
      </div>
      <nav className="nav">
        <ul>
          <li><Link to="/">Início</Link></li>
          <li><Link to="/results">Resultados</Link></li>
          <li><Link to="/my-tickets">Meus Bilhetes</Link></li>
          {user ? (
            <>
              <li><span>Olá, <span className="user-header">{user.name}</span></span></li>
              <li><button onClick={logout}>Sair</button></li>
            </>
          ) : (
            <li><Link to="/login" className="login-btn">Entrar</Link></li>
          )}
        </ul>
      </nav>
    </header>
  );
};

export default Header;
