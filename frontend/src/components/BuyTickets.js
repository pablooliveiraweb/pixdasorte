import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import axios from 'axios';
import '../styles/BuyTickets.css';

const BuyTickets = () => {
  const { user } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [tickets, setTickets] = useState([]);
  const [error, setError] = useState('');
  const [paymentInfo, setPaymentInfo] = useState(null);
  const navigate = useNavigate();

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
      navigate('/login'); // Redirecionar para a página de login
      return;
    }

    try {
      const response = await axios.post('http://localhost:5002/api/payments/create-pix-charge', {
        customer: user.asaasCustomerId,
        billingType: 'PIX',
        value: 5 * quantity,
        dueDate: new Date().toISOString().split('T')[0],
        description: 'Compra de bilhetes',
        externalReference: 'Ref123',
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
                <li key={index}>{ticket}</li>
              ))}
            </ul>
            <div className="payment-section">
              <p>Valor a pagar: R$ {5 * quantity}</p>
              {user ? (
                <button onClick={handlePayment}>Pagar meus Bilhetes</button>
              ) : (
                <button onClick={() => navigate('/login')}>Faça login para pagar</button>
              )}
            </div>
            {paymentInfo && (
              <div className="payment-info">
                <p>Código PIX: {paymentInfo.pixCopiaECola}</p>
                <img src={paymentInfo.pixQrCodeUrl} alt="QR Code" />
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
