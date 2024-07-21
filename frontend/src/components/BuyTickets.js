import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import axios from 'axios';
import '../styles/BuyTickets.css';

const BuyTickets = () => {
  const { user } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [tickets, setTickets] = useState([]);
  const [error, setError] = useState('');
  const [paymentLink, setPaymentLink] = useState('');

  const generateRandomNumber = () => {
    return Math.floor(Math.random() * 10);
  };

  const generateTicket = () => {
    const set1 = Array.from({ length: 5 }, generateRandomNumber).join('');
    const set2 = Array.from({ length: 5 }, generateRandomNumber).join('');
    return `${set1}, ${set2}`;
  };

  const handleGenerateTickets = () => {
    const newTickets = [];
    for (let i = 0; i < quantity; i++) {
      newTickets.push(generateTicket());
    }
    setTickets(newTickets);
  };

  const handlePayment = async () => {
    if (!user) {
      setError('Você precisa estar logado para comprar bilhetes.');
      return;
    }

    try {
      const response = await axios.post(
        'http://localhost:5002/api/payments/create-pix-charge',
        {
          customer: user.asaasCustomerId,
          billingType: 'PIX',
          value: 5 * quantity,
          dueDate: new Date().toISOString().split('T')[0],
          description: 'Compra de bilhetes',
          externalReference: 'Ref123',
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      setPaymentLink(response.data.invoiceUrl);
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
                <li key={index}>{ticket}</li>
              ))}
            </ul>
            <div className="payment-section">
              <p>Valor a pagar: R$ {5 * quantity}</p>
              <button onClick={handlePayment}>Pagar meu Bilhetes</button>
            </div>
            {paymentLink && (
              <div className="payment-info">
                <p>Para pagar, clique no link: <a href={paymentLink} target="_blank" rel="noopener noreferrer">Pagamento PIX</a></p>
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
