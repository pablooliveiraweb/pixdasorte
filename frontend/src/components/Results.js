import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Results.css';

const Results = () => {
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await axios.get('http://localhost:5002/api/admin/finished-lotteries');
        setResults(response.data);
      } catch (err) {
        setError('Erro ao buscar resultados dos sorteios.');
        console.error(err);
      }
    };

    fetchResults();
  }, []);

  return (
    <div className='results'>
      <h2>Prêmios sorteados</h2>
      {error && <p className='error'>{error}</p>}
      {results.length > 0 ? (
        results.map((result) => (
          <div key={result.id} className='result-card'>
            <p>SORTEIO: {result.lottery_name}</p>
            <p>DATA: {new Date(result.end_date).toLocaleDateString('pt-BR')}</p>
            <p>GANHADOR: {result.winner_name}</p>
            <p>BILHETE: {result.drawn_ticket}</p>
            <p>PRÊMIO: R$ {result.prize.toFixed(2)}</p>
          </div>
        ))
      ) : (
        <p>Nenhum resultado disponível</p>
      )}
    </div>
  );
};

export default Results;
