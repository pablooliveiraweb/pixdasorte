import React from 'react';

const UserCount = ({ count, users }) => {
  const lastSixUsers = users.slice(-10); // Pega os últimos 6 usuários

  return (
    <div className="user-count-container">
      <h2>Total de Usuários: {count}</h2>
      <ul>
      <h4>Ultimos Usuários Cadastrados:</h4>
        {lastSixUsers.map((user) => (
          <li key={user.id}>{user.name} - {user.cpf}</li>
        ))}
      </ul>
    </div>
  );
};

export default UserCount;
