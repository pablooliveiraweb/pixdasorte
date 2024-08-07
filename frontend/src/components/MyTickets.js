import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import { FaTrophy } from 'react-icons/fa';
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
        console.log('Tickets fetched:', response.data);
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
          lotteryId: ticket.lottery_id,
          lotteryName: ticket.lottery_name,
          startDate: ticket.start_date,
          endDate: ticket.end_date,
          image: ticket.lottery_image ? `http://localhost:5002/uploads/${ticket.lottery_image}` : null,
          paymentStatus: ticket.payment_status,
          drawnTicket: ticket.drawn_ticket,
          winner: ticket.winner_user_id === user.id ? 'Você' : ticket.winner_name,
          tickets: [],
          paymentInfo: ticket.payment_status === 'pending' ? {
            payload: ticket.payment_payload,
            qrCode: ticket.payment_qr_code
          } : null
        };
      }
      acc[ticket.lottery_id].tickets.push(ticket);
      return acc;
    }, {});

    // Convert object to array and sort by active status and start date
    const sortedGrouped = Object.values(grouped).sort((a, b) => {
      if (!a.drawnTicket && b.drawnTicket) return -1;
      if (a.drawnTicket && !b.drawnTicket) return 1;
      return new Date(b.startDate) - new Date(a.startDate);
    });
    setTicketsGroupedByLottery(sortedGrouped);
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return '';
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return new Date(dateTime).toLocaleString('pt-BR', options);
  };

  const handleCopy = (payload) => {
    navigator.clipboard.writeText(payload);
    alert('Código PIX copiado para a área de transferência!');
  };

  return (
    <div className="my-tickets-container">
      <h2>Meus Bilhetes</h2>
      {ticketsGroupedByLottery.length > 0 ? (
        <div className="tickets-grid">
          {ticketsGroupedByLottery.map((lottery) => (
            <div key={lottery.lotteryId} className="lottery-box">
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
                  {lottery.paymentStatus === 'pending' && lottery.paymentInfo && (
                    <div className="payment-info">
                      {lottery.paymentInfo.qrCode && (
                        <div className="qrcode-section">
                          <img src={'data:image/png;base64,' + lottery.paymentInfo.qrCode} alt="QR Code" />
                        </div>
                      )}
                      {lottery.paymentInfo.payload && (
                        <div className="copy-paste-section">
                          <p>Código copia e cola:</p>
                          <textarea readOnly value={lottery.paymentInfo.payload} />
                          <button onClick={() => handleCopy(lottery.paymentInfo.payload)}>Copiar Código</button>
                        </div>
                      )}
                    </div>
                  )}
                  {lottery.drawnTicket && (
                    <div className="winner-info">
                      <p><strong>Bilhete Sorteado:</strong> <span>{lottery.drawnTicket}</span></p>
                      <p className="winner-highlight">
                        <FaTrophy /> <strong>Ganhador:</strong> {lottery.winner}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <div className="ticket-list-my">
                {lottery.tickets.map((ticket) => (
                  <div key={ticket.id} className="ticket-item">
                    <p className='bilhete-p'>Bilhete:<br /><span className='ticket-p'>{ticket.numbers}</span></p>
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
