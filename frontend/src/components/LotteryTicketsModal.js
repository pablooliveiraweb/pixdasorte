import React, { useEffect, useState } from 'react';
import axios from 'axios';
import useAuth from '../hooks/useAuth';

const LotteryTicketsModal = ({ lottery, show, handleClose }) => {
  const { token } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await axios.get(`http://localhost:5002/api/lotteries/${lottery.id}/tickets`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setTickets(response.data);
      } catch (error) {
        setError('Erro ao obter bilhetes');
        console.error('Erro ao obter bilhetes:', error);
      }
    };

    if (show) {
      fetchTickets();
    }
  }, [show, lottery.id, token]);

  return (
    show && (
      <div className="modal">
        <div className="modal-content">
          <span className="close" onClick={handleClose}>&times;</span>
          <h2>Bilhetes do Sorteio {lottery.name}</h2>
          {error && <p>{error}</p>}
          <ul>
            {tickets.map((ticket) => (
              <li key={ticket.id}>{ticket.ticket_number}</li>
            ))}
          </ul>
        </div>
      </div>
    )
  );
};

export default LotteryTicketsModal;
