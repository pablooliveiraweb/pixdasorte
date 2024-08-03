import React from 'react';

const UserCount = ({ count, users }) => {
  return (
    <div className="user-count-container">
      <h2>Usuários Cadastrados: {count}</h2>
      <ul>
        {users.map((user) => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default UserCount;
