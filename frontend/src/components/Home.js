import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/Home.css';

const Home = () => {
  const [lottery, setLottery] = useState(null);
  const [error, setError] = useState('');
  const [accumulatedPrize, setAccumulatedPrize] = useState(0);

  useEffect(() => {
    const fetchActiveLottery = async () => {
      try {
        const response = await axios.get('http://localhost:5002/api/lotteries/active');
        const activeLottery = response.data;
        setLottery(activeLottery);

        const prizeResponse = await axios.get(`http://localhost:5002/api/lotteries/${activeLottery.id}/accumulated-prize`);
        setAccumulatedPrize(prizeResponse.data.accumulatedPrize);
      } catch (err) {
        setError('Erro ao buscar o sorteio ativo.');
        console.error(err);
      }
    };

    fetchActiveLottery();
  }, []);

  return (
    <div className="home-container">
      <div className="prize-box">
        <h2>Prêmio acumulado</h2>
        <p className="accumulated-prize"><span>R$</span> {accumulatedPrize.toFixed(2)}</p>
        {lottery ? (
          <img src={`http://localhost:5002/uploads/${lottery.image}`} alt={lottery.name} className="prize-image" />
        ) : (
          <div className="img-placeholder">img do prêmio</div>
        )}
        {error && <p className="error">{error}</p>}
        <Link to="/buy-tickets" className="buy-tickets-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-ticket">
            <path d="M22 10V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v4"></path>
            <path d="M22 14v4a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-4"></path>
            <line x1="22" y1="10" x2="2" y2="10"></line>
            <line x1="22" y1="14" x2="2" y2="14"></line>
            <path d="M2 6h20v4H2z"></path>
            <path d="M2 14h20v4H2z"></path>
          </svg>
          ADQUIRIR BILHETES
        </Link>
      </div>
    </div>
  );
};

export default Home;
