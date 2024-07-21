import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/MyTickets.css';

const MyTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [cpf, setCpf] = useState('');
  const [error, setError] = useState('');
  const [isLogged, setIsLogged] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Verifica se o usuário está logado
    const loggedUser = JSON.parse(localStorage.getItem('user'));
    if (loggedUser) {
      setUser(loggedUser);
      setIsLogged(true);
      fetchTickets(loggedUser.cpf);
    }
  }, []);

  const fetchTickets = async (cpf) => {
    try {
      const response = await axios.get(`http://localhost:5002/api/tickets/${cpf}`);
      setTickets(response.data);
    } catch (err) {
      setError('Erro ao buscar bilhetes.');
      console.error(err);
    }
  };

  const handleSearch = () => {
    fetchTickets(cpf);
  };

  return (
    <div className="my-tickets-container">
      {isLogged ? (
        <>
          <h2>Meus Bilhetes</h2>
          <ul className="tickets-list">
            {tickets.map((ticket) => (
              <li key={ticket.id}>{ticket.numbers}</li>
            ))}
          </ul>
        </>
      ) : (
        <div className="cpf-search">
          <h2>Buscar Bilhetes</h2>
          <input
            type="text"
            placeholder="Digite o CPF"
            value={cpf}
            onChange={(e) => setCpf(e.target.value)}
          />
          <button onClick={handleSearch}>Buscar</button>
        </div>
      )}
      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default MyTickets;
