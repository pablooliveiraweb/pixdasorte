import React from 'react';
import { Route, Routes, Link } from 'react-router-dom';
import CreateLottery from './CreateLottery';
import LotteryList from './LotteryList';
import UserList from './UserList'; // Importe o componente de lista de usuários
import '../styles/AdminPanel.css'; // Importe o CSS

const AdminPanel = () => {
  return (
    <div className="admin-panel">
      <aside className="admin-sidebar">
        <ul>
          <li>
            <Link to="/admin/create-lottery">Criar Sorteio</Link>
          </li>
          <li>
            <Link to="/admin/lotteries">Sorteios Criados</Link>
          </li>
          <li>
            <Link to="/admin/users">Usuários Cadastrados</Link>
          </li>
        </ul>
      </aside>
      <main className="admin-main">
        <Routes>
          <Route path="/create-lottery" element={<CreateLottery />} />
          <Route path="/lotteries" element={<LotteryList />} />
          <Route path="/users" element={<UserList />} /> {/* Adicione a rota para lista de usuários */}
        </Routes>
      </main>
    </div>
  );
};

export default AdminPanel;
