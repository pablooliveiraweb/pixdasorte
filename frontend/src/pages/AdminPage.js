import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AdminPanel from '../components/AdminPanel';

const AdminPage = () => {
  return (
    <>
      <Header />
      <div className='container'>
        <AdminPanel />
      </div>
      <Footer />
    </>
  );
};

export default AdminPage;
