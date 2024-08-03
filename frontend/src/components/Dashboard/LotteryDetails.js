import React from 'react';

const LotteryDetails = ({ lottery }) => {
  
  return (
    <div className="lottery-details">
      <h3>{lottery.name}</h3>
      <p>Arrecadado: R$ {lottery.total_amount}</p>
    </div>
  );
};

export default LotteryDetails;
