import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AuthForm from '../components/AuthForm';

const LoginPage = () => {
  return (
    <>
      <Header />
      <div className='container'>
        <AuthForm />
      </div>
      <Footer />
    </>
  );
};

export default LoginPage;
