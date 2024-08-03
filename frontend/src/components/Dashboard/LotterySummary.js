import React from 'react';

const LotterySummary = ({ summary }) => {
  return (
    <div className="lottery-summary-container">
      <h2>Resumo dos Sorteios</h2>
      <table>
        <thead>
          <tr>
            <th>Sorteio</th>
            <th>Total Pago</th>
          </tr>
        </thead>
        <tbody>
          {summary.map((lottery) => (
            <tr key={lottery.id}>
              <td>{lottery.name}</td>
              <td>R$ {(+lottery.totalpaidamount || 0).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LotterySummary;
