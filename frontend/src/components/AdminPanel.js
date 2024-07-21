import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminPanel = () => {
  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]);
  const [prize, setPrize] = useState(0);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await axios.get('http://localhost:5002/api/admin/tickets', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        setTickets(response.data);
      } catch (error) {
        console.error(error.response.data);
      }
    };

    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:5002/api/admin/users', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        setUsers(response.data);
      } catch (error) {
        console.error(error.response.data);
      }
    };

    fetchTickets();
    fetchUsers();
  }, []);

  const handleDraw = async () => {
    try {
      const response = await axios.post('http://localhost:5002/api/admin/draw', { prize }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      console.log(response.data);
    } catch (error) {
      console.error(error.response.data);
    }
  };

  return (
    <div className='container'>
      <h2>Painel Admin</h2>
      <div>
        <h3>Bilhetes Vendidos</h3>
        <ul>
          {tickets.map((ticket) => (
            <li key={ticket.id}>{ticket.numbers}</li>
          ))}
        </ul>
      </div>
      <div>
        <h3>Usuários Registrados</h3>
        <ul>
          {users.map((user) => (
            <li key={user.id}>{user.name}</li>
          ))}
        </ul>
      </div>
      <div>
        <h3>Fazer Sorteio</h3>
        <input
          type='number'
          value={prize}
          onChange={(e) => setPrize(e.target.value)}
          placeholder='Valor do Prêmio'
        />
        <button onClick={handleDraw}>Realizar Sorteio</button>
      </div>
    </div>
  );
};

export default AdminPanel;
