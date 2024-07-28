import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import axios from 'axios';
import Modal from 'react-modal';
import '../styles/BuyTickets.css';

const BuyTickets = () => {
  const { user, token } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [tickets, setTickets] = useState([]);
  const [error, setError] = useState('');
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const handleGenerateTickets = async () => {
    if (!token) {
      setError('Token não encontrado. Por favor, faça login novamente.');
      return;
    }

    try {
      const response = await axios.get(`http://localhost:5002/api/tickets/available/${quantity}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTickets(response.data);
      setModalIsOpen(true);
    } catch (err) {
      console.error('Erro ao obter bilhetes disponíveis:', err);
      setError('Erro ao obter bilhetes disponíveis.');
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
        tickets: tickets.map(ticket => ticket.id),
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setPaymentInfo(response.data);
    } catch (err) {
      setError('Erro ao criar cobrança PIX.');
      console.error(err);
    }
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setTickets([]);
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
        {error && <p className="error">{error}</p>}
        <Modal
          isOpen={modalIsOpen}
          onRequestClose={closeModal}
          contentLabel="Bilhetes Disponíveis"
          className="react-modal-content"
          overlayClassName="react-modal-overlay"
        >
          <div className="modal-content">
            <h2>Bilhetes Disponíveis</h2>
            <button onClick={closeModal}>Fechar</button>
            <div className="ticket-list-container">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="ticket-item">
                  {ticket.ticket_number}
                </div>
              ))}
            </div>
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
        </Modal>
      </div>
    </div>
  );
};

export default BuyTickets;
