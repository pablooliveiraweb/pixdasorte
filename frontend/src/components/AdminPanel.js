import React from 'react';
import { Route, Routes, Link } from 'react-router-dom';
import CreateLottery from './CreateLottery';
import LotteryList from './LotteryList';
import UserList from './UserList';
import Dashboard from './Dashboard/Dashboard'; // Corrigir o caminho de importação
import '../styles/AdminPanel.css';

const AdminPanel = () => {
  return (
    <div className="admin-panel">
      <aside className="admin-sidebar">
        <ul>
          <li>
            <Link to="/admin/dashboard">Dashboard</Link>
          </li>
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
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/create-lottery" element={<CreateLottery />} />
          <Route path="/lotteries" element={<LotteryList />} />
          <Route path="/users" element={<UserList />} />
        </Routes>
      </main>
    </div>
  );
};

export default AdminPanel;
