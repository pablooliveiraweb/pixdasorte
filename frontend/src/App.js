import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './components/Home';
import BuyTickets from './components/BuyTickets';
import Login from './components/Login';
import Register from './components/Register';
import MyTickets from './components/MyTickets';
import Results from './components/Results';
import AdminPanel from './components/AdminPanel';
import './styles/global.css';

function App() {
  return (
    <div>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/buy-tickets" element={<BuyTickets />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/my-tickets" element={<MyTickets />} />
        <Route path="/results" element={<Results />} />
        <Route path="/admin/*" element={<AdminPanel />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;
