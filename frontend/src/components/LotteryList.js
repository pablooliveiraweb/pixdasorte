import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import Modal from 'react-modal';
import '../styles/LotteryList.css';

Modal.setAppElement('#root');

const LotteryList = () => {
  const { token } = useAuth();
  const [lotteries, setLotteries] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [successModalIsOpen, setSuccessModalIsOpen] = useState(false);

  const fetchLotteries = async () => {
    try {
      const response = await axios.get('http://localhost:5002/api/lotteries', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLotteries(response.data.reverse()); // Inverte a ordem dos sorteios
    } catch (error) {
      console.error('Erro ao obter sorteios:', error);
      setError('Erro ao obter sorteios');
    }
  };

  useEffect(() => {
    fetchLotteries();
  }, [token]);

  useEffect(() => {
    if (success) {
      setSuccessModalIsOpen(true);
      setTimeout(() => {
        setSuccessModalIsOpen(false);
        setSuccess('');
      }, 3000);
    }
  }, [success]);

  const openModal = async (lottery) => {
    setModalIsOpen(true);

    try {
      const response = await axios.get(`http://localhost:5002/api/lotteries/${lottery.id}/tickets`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTickets(response.data);
    } catch (error) {
      console.error('Erro ao obter bilhetes:', error);
      setError('Erro ao obter bilhetes');
    }
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setTickets([]);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5002/api/lotteries/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLotteries(lotteries.filter((lottery) => lottery.id !== id));
      setSuccess('Sorteio excluído com sucesso');
    } catch (error) {
      console.error('Erro ao excluir sorteio:', error);
      setError('Erro ao excluir sorteio');
    }
  };

  const handleDraw = async (id) => {
    const password = prompt('Digite a senha para realizar o sorteio:');
    if (!password) {
      setError('Senha é obrigatória');
      return;
    }
  
    try {
      const response = await axios.post(`http://localhost:5002/api/lotteries/${id}/draw`, { password }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess(`Sorteio realizado com sucesso! Bilhete sorteado: ${response.data.drawnTicket}`);
      fetchLotteries(); // Atualizar a lista de sorteios após o sorteio
    } catch (error) {
      console.error('Erro ao realizar sorteio:', error);
      setError('Erro ao realizar sorteio');
    }
  };
  

  const formatDateTime = (dateTime) => {
    if (!dateTime) return '';
    const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' };
    return new Date(dateTime).toLocaleString('pt-BR', options);
  };

  return (
    <div className="lottery-list-container">
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <Modal
        isOpen={successModalIsOpen}
        onRequestClose={() => setSuccessModalIsOpen(false)}
        contentLabel="Sucesso"
        className="react-modal-content"
        overlayClassName="react-modal-overlay"
      >
        <div className="success-modal-content">
          <p>{success}</p>
          <div className="progress-bar"></div>
        </div>
      </Modal>
      {lotteries.map((lottery) => (
        <div key={lottery.id} className="lottery-card">
          <h3>{lottery.name}</h3>
          <p>Data de Início: {new Date(lottery.start_date).toLocaleDateString('pt-BR')}</p>
          <p>Data de Término: {new Date(lottery.end_date).toLocaleDateString('pt-BR')}</p>
          <p>Quantidade de Bilhetes: {lottery.ticket_quantity}</p>
          {lottery.drawn_ticket ? (
            <>
              <p className="drawn-ticket">Bilhete Sorteado: {lottery.drawn_ticket}</p>
              <p className="draw-date">Sorteio realizado dia {formatDateTime(lottery.draw_date)}</p>
            </>
          ) : (
            <button onClick={() => handleDraw(lottery.id)}>Realizar Sorteio</button>
          )}
          <button onClick={() => openModal(lottery)}>Ver Bilhetes</button>
          <button onClick={() => handleDelete(lottery.id)}>Excluir</button>
        </div>
      ))}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Bilhetes do Sorteio"
        className="react-modal-content"
        overlayClassName="react-modal-overlay"
      >
        <div className="modal-content">
          <h2>Bilhetes do Sorteio</h2>
          <button onClick={closeModal}>Fechar</button>
          <ul className="ticket-list">
            {tickets.map((ticket) => (
              <li key={ticket.id} className={ticket.status === 'paid' ? 'ticket-item paid' : 'ticket-item'}>
                {ticket.ticket_number}
              </li>
            ))}
          </ul>
        </div>
      </Modal>
    </div>
  );
};

export default LotteryList;
