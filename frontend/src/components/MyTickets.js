import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import '../styles/MyTickets.css';

const MyTickets = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await axios.get('http://localhost:5002/api/tickets/user-tickets', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setTickets(response.data);
      } catch (err) {
        setError('Erro ao buscar bilhetes.');
        console.error(err);
      }
    };

    if (user) {
      fetchTickets();
    }
  }, [user]);

  return (
    <div className="my-tickets-container">
      <h2>Meus Bilhetes</h2>
      {tickets.length > 0 ? (
        <ul className="tickets-list">
          {tickets.map((ticket) => (
            <li key={ticket.id}>
              {ticket.numbers} - {ticket.status === 'paid' ? 'Pago' : 'Pendente'}
            </li>
          ))}
        </ul>
      ) : (
        <p>Você não possui bilhetes.</p>
      )}
      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default MyTickets;
