import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import axios from 'axios';
import '../styles/BuyTickets.css';

const BuyTickets = () => {
  const { user, token } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [tickets, setTickets] = useState([]);
  const [error, setError] = useState('');
  const [paymentInfo, setPaymentInfo] = useState(null);

  const generateRandomNumber = () => Math.floor(Math.random() * 10);

  const generateTicket = () => {
    const set1 = Array.from({ length: 5 }, generateRandomNumber).join('');
    const set2 = Array.from({ length: 5 }, generateRandomNumber).join('');
    return `${set1}, ${set2}`;
  };

  const handleGenerateTickets = async () => {
    const newTickets = [];
    for (let i = 0; i < quantity; i++) {
      newTickets.push(generateTicket());
    }

    console.log('Generated Tickets:', newTickets);

    if (!token) {
      setError('Token não encontrado. Por favor, faça login novamente.');
      return;
    }

    try {
      const ticketResponses = [];
      for (let ticket of newTickets) {
        console.log('Sending token:', token); // Log do token enviado
        const response = await axios.post('http://localhost:5002/api/tickets/buy', { numbers: ticket }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        ticketResponses.push(response.data);
      }
      setTickets(ticketResponses);
    } catch (err) {
      console.error('Erro ao salvar bilhetes:', err);
      setError('Erro ao salvar bilhetes.');
    }
  };

  const handlePayment = async () => {
    if (!user) {
      setError('Você precisa estar logado para comprar bilhetes.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5002/api/payments/create-pix-charge', {
        customer: user.asaasCustomerId,
        value: 5 * quantity,
        tickets: tickets.map(ticket => ticket.id), // Passando os IDs dos bilhetes
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setPaymentInfo(response.data);
    } catch (err) {
      setError('Erro ao criar cobrança PIX.');
      console.error(err);
    }
  };

  return (
    <div className="buy-tickets-container">
      <div className="buy-tickets-box">
        <h2>Prêmio acumulado</h2>
        <h3>R$ 5,500.00</h3>
        <div className="generate-section">
          <label htmlFor="quantity">QTD</label>
          <input
            id="quantity"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            min="1"
          />
          <button onClick={handleGenerateTickets}>GERAR BILHETES</button>
        </div>
        {tickets.length > 0 && (
          <div className="tickets-generated">
            <ul>
              {tickets.map((ticket, index) => (
                <li key={index}>{ticket.numbers}</li>
              ))}
            </ul>
            <div className="payment-section">
              <p>Valor a pagar: R$ {5 * quantity}</p>
              <button onClick={handlePayment}>Pagar meus Bilhetes</button>
            </div>
            {paymentInfo && (
              <div className="payment-info">
                <p>Para pagar, clique no link: <a href={paymentInfo.invoiceUrl} target="_blank" rel="noopener noreferrer">Pagamento PIX</a></p>
              </div>
            )}
          </div>
        )}
        {error && <p className="error">{error}</p>}
      </div>
    </div>
  );
};

export default BuyTickets;
