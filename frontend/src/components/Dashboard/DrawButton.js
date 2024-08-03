import React from 'react';
import axios from 'axios';

const DrawButton = () => {
  const handleDraw = async () => {
    const lotteryId = prompt('Digite o ID do sorteio para realizar o sorteio:');
    const password = prompt('Digite a senha para realizar o sorteio:');
    try {
      await axios.post(`http://localhost:5002/api/lotteries/${lotteryId}/draw`, { password });
      alert('Sorteio realizado com sucesso!');
    } catch (err) {
      console.error('Erro ao realizar sorteio:', err);
      alert('Erro ao realizar sorteio.');
    }
  };

  return (
    <div className="dashboard-card">
      <h2>Realizar Sorteio</h2>
      <button onClick={handleDraw}>Sortear Bilhete</button>
    </div>
  );
};

export default DrawButton;
