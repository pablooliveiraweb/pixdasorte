import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BuyTickets from '../components/BuyTickets';

const BuyTicketsPage = () => {
  return (
    <>
      <Header />
      <div className='container'>
        <BuyTickets />
      </div>
      <Footer />
    </>
  );
};

export default BuyTicketsPage;
