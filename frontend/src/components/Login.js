import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios'; // Importar axios
import { useAuth } from '../hooks/useAuth';
import '../styles/Auth.css';

const Login = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:5002/api/users/login', { email, password });
      login(response.data.token); // Usar o token do response
      navigate(from, { replace: true });
    } catch (error) {
      setError('Falha no login. Verifique suas credenciais.');
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Entrar</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Entrar</button>
        {error && <p className="error">{error}</p>}
        <div className="register-link">
          <p>Não possui conta? <Link to="/register">Cadastre-se aqui</Link></p>
        </div>
      </form>
    </div>
  );
};

export default Login;
