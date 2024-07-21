import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './components/Home';
import BuyTickets from './components/BuyTickets';
import Login from './components/Login';
import Register from './components/Register';
import MyTickets from './components/MyTickets';
import Results from './components/Results';
import { AuthProvider } from './context/AuthContext';
import './styles/global.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/buy-tickets" element={<BuyTickets />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/my-tickets" element={<MyTickets />} />
          <Route path="/results" element={<Results />} />
        </Routes>
        <Footer />
      </Router>
    </AuthProvider>
  );
}

export default App;
