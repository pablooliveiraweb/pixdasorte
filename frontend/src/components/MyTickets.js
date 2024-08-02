import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import '../styles/MyTickets.css';

const MyTickets = () => {
  const { user, token } = useAuth();
  const [ticketsGroupedByLottery, setTicketsGroupedByLottery] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await axios.get('http://localhost:5002/api/tickets/user-tickets', {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Tickets fetched:', response.data); // Adicione este log
        groupTicketsByLottery(response.data);
      } catch (err) {
        setError('Erro ao buscar bilhetes.');
        console.error(err);
      }
    };

    if (user) {
      fetchTickets();
    }
  }, [user, token]);

  const groupTicketsByLottery = (tickets) => {
    const grouped = tickets.reduce((acc, ticket) => {
      if (!acc[ticket.lottery_id]) {
        acc[ticket.lottery_id] = {
          lotteryName: ticket.lottery_name,
          startDate: ticket.start_date,
          endDate: ticket.end_date,
          image: ticket.lottery_image ? `http://localhost:5002/uploads/${ticket.lottery_image}` : null,
          paymentStatus: ticket.payment_status,
          drawnTicket: ticket.drawn_ticket,
          winner: ticket.winner_user_id === user.id ? 'Você' : ticket.winner_name,
          tickets: []
        };
      }
      acc[ticket.lottery_id].tickets.push(ticket);
      return acc;
    }, {});
    setTicketsGroupedByLottery(Object.values(grouped));
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return '';
    const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' };
    return new Date(dateTime).toLocaleString('pt-BR', options);
  };

  return (
    <div className="my-tickets-container">
      <h2>Meus Bilhetes</h2>
      {ticketsGroupedByLottery.length > 0 ? (
        <div className="tickets-grid">
          {ticketsGroupedByLottery.map((lottery) => (
            <div key={lottery.lotteryName} className="lottery-box">
              <div className="lottery-info">
                {lottery.image ? (
                  <img src={lottery.image} alt={lottery.lotteryName} className="lottery-image" />
                ) : (
                  <div className="img-placeholder">Imagem não disponível</div>
                )}
                <div className="lottery-details">
                  <h3>{lottery.lotteryName}</h3>
                  <p>Início: {formatDateTime(lottery.startDate)}</p>
                  <p>Término: {formatDateTime(lottery.endDate)}</p>
                  <p className={`status ${lottery.paymentStatus === 'RECEIVED' ? '' : 'pending'}`}>
                    Pagamento: {lottery.paymentStatus === 'RECEIVED' ? 'Recebido' : 'Pendente'}
                  </p>
                  {lottery.drawnTicket && (
                    <>
                      <p>Bilhete Sorteado: {lottery.drawnTicket}</p>
                      <p>Ganhador: {lottery.winner}</p>
                    </>
                  )}
                </div>
              </div>
              <div className="ticket-list-my">
                {lottery.tickets.map((ticket, index) => (
                  <div key={ticket.id} className="ticket-item">
                    <p className='bilhete-p'>Bilhete:<br /> <span className='ticket-p'>{ticket.numbers}</span></p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>Você não possui bilhetes.</p>
      )}
      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default MyTickets;
