import React, { useEffect, useState } from 'react';
import axios from 'axios';
import UserCount from './UserCount';
import LotterySummary from './LotterySummary';
import WinnerList from './WinnerList';
import '../../styles/Dashboard.css'; // Corrigido o caminho do import
import { useAuth } from '../../hooks/useAuth';

const Dashboard = () => {
  const { token } = useAuth();
  const [userCount, setUserCount] = useState(0);
  const [users, setUsers] = useState([]);
  const [lotterySummary, setLotterySummary] = useState([]);
  const [winners, setWinners] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userCountResponse = await axios.get('http://localhost:5002/api/admin/user-count', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserCount(userCountResponse.data.count);

        const usersResponse = await axios.get('http://localhost:5002/api/admin/users', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(usersResponse.data);

        const lotterySummaryResponse = await axios.get('http://localhost:5002/api/admin/lottery-summary', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLotterySummary(lotterySummaryResponse.data);

        const winnersResponse = await axios.get('http://localhost:5002/api/admin/winners', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setWinners(winnersResponse.data);
      } catch (err) {
        setError('Erro ao carregar dados do painel de administração.');
        console.error(err);
      }
    };

    fetchData();
  }, [token]);

  return (
    <div className="dashboard-container">
      <h1>Painel Administrativo</h1>
      {error && <p className="error">{error}</p>}
      <div className="dashboard-section">
        <UserCount count={userCount} users={users} />
        <LotterySummary summary={lotterySummary} />
        <WinnerList winners={winners} />
      </div>
    </div>
  );
};

export default Dashboard;
