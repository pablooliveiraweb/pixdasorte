import React from 'react';
import '../styles/Results.css';

const Results = () => {
  return (
    <div className='results'>
      <h2>Prêmio sorteado</h2>
      <div className='result-card'>
        <p>SORTEIO COM INÍCIO 10/06</p>
        <p>GANHADOR: FABRICIO OLIVEIRA</p>
        <p>Bilhete: 22, 11, 12, 43, 52</p>
      </div>
      <div className='result-card'>
        <p>SORTEIO COM INÍCIO 10/06</p>
        <p>GANHADOR: CARLOS VIANA</p>
        <p>Bilhete: 55, 31, 12, 23, 52</p>
      </div>
    </div>
  );
};

export default Results;
