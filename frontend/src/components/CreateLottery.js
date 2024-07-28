import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import '../styles/CreateLottery.css';

const CreateLottery = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [ticketQuantity, setTicketQuantity] = useState('');
  const [image, setImage] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('name', name);
    formData.append('startDate', startDate);
    formData.append('endDate', endDate);
    formData.append('ticketQuantity', ticketQuantity);
    formData.append('image', image);

    try {
      const response = await axios.post('http://localhost:5002/api/lotteries', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccess('Sorteio criado com sucesso!');
      setError('');
      console.log('Sorteio criado:', response.data);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        setError('Token expirado, faça login novamente');
        navigate('/login'); // Redirecionar para a página de login
      } else {
        setError('Erro ao criar sorteio');
      }
      setSuccess('');
      console.error('Erro ao criar sorteio:', error);
    }
  };

  return (
    <div className="create-lottery">
      <h2>Criar Sorteio</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Nome:</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <label>Data de Início:</label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
        </div>
        <div>
          <label>Data de Término:</label>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
        </div>
        <div>
          <label>Quantidade de Bilhetes:</label>
          <input type="number" value={ticketQuantity} onChange={(e) => setTicketQuantity(e.target.value)} required />
        </div>
        <div>
          <label>Imagem:</label>
          <input type="file" onChange={(e) => setImage(e.target.files[0])} required />
        </div>
        <button type="submit">Criar Sorteio</button>
      </form>
      {error && <p>{error}</p>}
      {success && <p>{success}</p>}
    </div>
  );
};

export default CreateLottery;
