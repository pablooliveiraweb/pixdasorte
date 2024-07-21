import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    cpf: '',
    pix: '',
    password: '',
  });
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/users/register', formData);
      login(response.data);
      navigate(from, { replace: true });
    } catch (error) {
      console.error(error.response.data);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type='text' name='name' placeholder='Nome' onChange={handleChange} required />
      <input type='email' name='email' placeholder='Email' onChange={handleChange} required />
      <input type='text' name='phone' placeholder='Telefone' onChange={handleChange} required />
      <input type='text' name='cpf' placeholder='CPF' onChange={handleChange} required />
      <input type='text' name='pix' placeholder='PIX' onChange={handleChange} required />
      <input type='password' name='password' placeholder='Senha' onChange={handleChange} required />
      <button type='submit'>Registrar</button>
    </form>
  );
};

export default Register;
