import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import Modal from 'react-modal';
import '../styles/LotteryList.css';

const LotteryList = () => {
  const { token } = useAuth();
  const [lotteries, setLotteries] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchLotteries = async () => {
    try {
      const response = await axios.get('http://localhost:5002/api/lotteries', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLotteries(response.data);
    } catch (error) {
      console.error('Erro ao obter sorteios:', error);
      setError('Erro ao obter sorteios');
    }
  };

  useEffect(() => {
    fetchLotteries();
  }, [token]);

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
    console.log('Senha digitada:', password);

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

  return (
    <div className="lottery-list-container">
      <h2>Sorteios Criados</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
      {lotteries.map((lottery) => (
        <div key={lottery.id} className="lottery-card">
          <h3>{lottery.name}</h3>
          <p>Data de Início: {new Date(lottery.start_date).toLocaleDateString()}</p>
          <p>Data de Término: {new Date(lottery.end_date).toLocaleDateString()}</p>
          <p>Quantidade de Bilhetes: {lottery.ticket_quantity}</p>
          {lottery.drawn_ticket ? (
            <p className="drawn-ticket">Bilhete Sorteado: {lottery.drawn_ticket}</p>
          ) : (
            <button onClick={() => handleDraw(lottery.id)}>Realizar Sorteio</button>
          )}
          <button onClick={() => openModal(lottery)}>Ver Bilhetes</button>
          <button onClick={() => handleDelete(lottery.id)}>Excluir</button>
        </div>
      ))}
      <Modal isOpen={modalIsOpen} onRequestClose={closeModal} contentLabel="Bilhetes do Sorteio">
        <div className="modal-content">
          <h2>Bilhetes do Sorteio</h2>
          <button onClick={closeModal}>Fechar</button>
          <ul className="ticket-list">
            {tickets.map((ticket) => (
              <li key={ticket.id}>{ticket.ticket_number}</li>
            ))}
          </ul>
        </div>
      </Modal>
    </div>
  );
};

export default LotteryList;
