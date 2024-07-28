import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import '../styles/UserList.css';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const { token } = useAuth();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:5002/api/users', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUsers(response.data);
      } catch (error) {
        console.error('Erro ao obter usuários:', error);
      }
    };

    fetchUsers();
  }, [token]);

  return (
    <div className="user-list">
      <h2>Usuários Cadastrados</h2>
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            <h3>{user.name}</h3>
            <p>Email: {user.email}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserList;
