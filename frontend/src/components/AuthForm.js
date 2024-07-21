import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import '../styles/AuthForm.css';

const AuthForm = () => {
  const [formData, setFormData] = useState({ email: '', password: '', name: '', phone: '', cpf: '', pix: '' });
  const [isRegistering, setIsRegistering] = useState(false);
  const { login } = useAuth();
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://localhost:5002/api/users/login', { email: formData.email, password: formData.password });
      login(response.data.token);
      navigate('/'); // Navegação após login
    } catch (error) {
      setError(error.response?.data?.message || 'Erro ao fazer login');
    }
  };

  const handleRegister = async () => {
    try {
      const response = await axios.post('http://localhost:5002/api/users/register', formData);
      login(response.data.token);
      navigate('/'); // Navegação após registro
    } catch (error) {
      setError(error.response?.data?.message || 'Erro ao registrar');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (isRegistering) {
      handleRegister();
    } else {
      handleLogin();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      {isRegistering && (
        <>
          <input type='text' name='name' placeholder='Nome' onChange={handleChange} required />
          <input type='email' name='email' placeholder='Email' onChange={handleChange} required />
          <input type='text' name='phone' placeholder='Telefone' onChange={handleChange} required />
          <input type='text' name='cpf' placeholder='CPF' onChange={handleChange} required />
          <input type='text' name='pix' placeholder='PIX' onChange={handleChange} required />
        </>
      )}
      <input type='email' name='email' placeholder='Email' onChange={handleChange} required />
      <input type='password' name='password' placeholder='Senha' onChange={handleChange} required />
      <button type='submit'>{isRegistering ? 'Registrar' : 'Login'}</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <p onClick={() => setIsRegistering(!isRegistering)}>
        {isRegistering ? 'Já tem uma conta? Login' : 'Não tem uma conta? Registre-se'}
      </p>
    </form>
  );
};

export default AuthForm;
