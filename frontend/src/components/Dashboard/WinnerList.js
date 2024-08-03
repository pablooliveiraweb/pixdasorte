import React from 'react';

const WinnerList = ({ winners }) => {
  return (
    <div className="winner-list-container">
      <h2>Ganhadores Recentes</h2>
      <table>
        <thead>
          <tr>
            <th>Sorteio</th>
            <th>Ganhador</th>
          </tr>
        </thead>
        <tbody>
          {winners.map((winner) => (
            <tr key={winner.lottery_id}>
              <td>{winner.lottery_name}</td>
              <td className="winner-highlight">{winner.winner_name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default WinnerList;
