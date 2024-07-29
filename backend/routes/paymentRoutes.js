const express = require('express');
const axios = require('axios');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const pool = require('../config/db');  // Certifique-se de importar o pool aqui
const uuid = require('uuid');
require('dotenv').config();

const ASAAS_API_KEY = process.env.ASAAS_API_KEY_SANDBOX || process.env.ASAAS_API_KEY_PRODUCTION;
const ASAAS_API_URL = process.env.ASAAS_MODE === 'production' ? 'https://www.asaas.com/api/v3' : 'https://sandbox.asaas.com/api/v3';

// Função para criar uma cobrança PIX
router.post('/create-pix-charge', protect, async (req, res) => {
  const { customer, value, tickets } = req.body;

  console.log('Received request to create PIX charge');
  console.log('Customer:', customer);
  console.log('Value:', value);

  if (!customer || !value || !tickets) {
    console.error('Customer, value, and tickets are required');
    return res.status(400).json({ error: 'Customer, value, and tickets are required' });
  }

  const payment_id = uuid.v4();

  try {
    const payload = {
      customer,
      billingType: 'PIX',
      value,
      dueDate: new Date(new Date().getTime() + 3 * 60000).toISOString(), // Prazo de pagamento 3 min
      description: 'Compra de bilhetes',
      externalReference: payment_id,
    };

    console.log('Creating PIX charge with payload:', payload);

    const response = await axios.post(`${ASAAS_API_URL}/payments`, payload, {
      headers: {
        'Content-Type': 'application/json',
        access_token: ASAAS_API_KEY,
      },
    });

    const paymentData = response.data;

    // Salvar a cobrança PIX no banco de dados
    await pool.query(
      'INSERT INTO payments (id, user_id, amount, status, asaas_payment_id) VALUES ($1, $2, $3, $4, $5)',
      [payment_id, req.user.id, value, paymentData.status, paymentData.id]
    );

    const responseQr = await axios.get(`${ASAAS_API_URL}/payments/${paymentData.id}/pixQrCode`, {
      headers: {
        'Content-Type': 'application/json',
        access_token: ASAAS_API_KEY,
      },
    });

    res.json({ ...paymentData, ...responseQr.data, payment_id });
  } catch (error) {
    console.error('Erro ao criar cobrança PIX:', error.response?.data || error.message);
    res.status(500).json({ error: 'Erro ao criar cobrança PIX' });
  }
});

// Função para verificar o status do pagamento
router.get('/check-payment-status/:paymentId', protect, async (req, res) => {
  const { paymentId } = req.params;

  try {
    const paymentResult = await pool.query('SELECT * FROM payments WHERE id = $1', [paymentId]);
    const payment = paymentResult.rows[0];

    if (!payment) {
      return res.status(404).json({ message: 'Pagamento não encontrado' });
    }

    const response = await axios.get(`${ASAAS_API_URL}/payments/${payment.asaas_payment_id}`, {
      headers: {
        'Content-Type': 'application/json',
        access_token: ASAAS_API_KEY,
      },
    });

    const updatedStatus = response.data.status;

    // Atualizar o status do pagamento no banco de dados
    await pool.query('UPDATE payments SET status = $1 WHERE id = $2', [updatedStatus, paymentId]);
    await pool.query('UPDATE tickets SET status = $1 WHERE payment_id = $2', [updatedStatus === 'RECEIVED' ? 'paid' : 'pending', paymentId]);

    res.json({ status: updatedStatus });
  } catch (error) {
    console.error('Erro ao verificar status do pagamento:', error.response?.data || error.message);
    res.status(500).json({ error: 'Erro ao verificar status do pagamento' });
  }
});

module.exports = router;
