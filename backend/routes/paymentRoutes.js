const express = require('express');
const axios = require('axios');
const router = express.Router();
const uuid = require('uuid');
const pool = require('../config/db');
require('dotenv').config();
const { protect, admin } = require('../middleware/authMiddleware');

const ASAAS_API_KEY_SANDBOX = process.env.ASAAS_API_KEY_SANDBOX;
const ASAAS_API_KEY_PRODUCTION = process.env.ASAAS_API_KEY_PRODUCTION;
const ASAAS_MODE = process.env.ASAAS_MODE || 'sandbox';

const getAsaasApiKey = () => {
  return ASAAS_MODE === 'production' ? ASAAS_API_KEY_PRODUCTION : ASAAS_API_KEY_SANDBOX;
};

const getAsaasApiUrl = () => {
  return ASAAS_MODE === 'production'
    ? 'https://www.asaas.com/api/v3'
    : 'https://sandbox.asaas.com/api/v3';
};

const urlQr = (id) => ASAAS_MODE === 'production'
  ? `https://www.asaas.com/api/v3/payments/${id}/pixQrCode`
  : `https://sandbox.asaas.com/api/v3/payments/${id}/pixQrCode`;

router.post('/create-pix-charge',protect, async (req, res) => {
  const { customer, value, tickets } = req.body;

  console.log('Received request to create PIX charge');
  console.log('Customer:', customer);
  console.log('Value:', value);
  console.log('Tickets:', tickets);

  if (!customer || !value || !tickets) {
    console.error('Customer, value, and tickets are required');
    return res.status(400).json({ error: 'Customer, value, and tickets are required' });
  }

  try {
    const payload = {
      customer: customer,
      billingType: 'PIX',
      value: value,
      dueDate: new Date(new Date().getTime() + 5 * 60000).toISOString(), // Prazo de pagamento 5 min
      description: 'Compra de bilhetes',
      externalReference: uuid.v4(),
    };

    console.log('Creating PIX charge with payload:', payload);
    console.log('Using API Key:', getAsaasApiKey());

    const response = await axios.post(
      `${getAsaasApiUrl()}/payments`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          'access_token': getAsaasApiKey(),
        },
      }
    );

    if (!response.data || !response.data.id) {
      throw new Error('Asaas response does not contain payment id');
    }

    console.log('PIX charge created:', response.data);

    const responseQr = await axios.get(urlQr(response.data.id), {
      headers: {
        'Content-Type': 'application/json',
        'access_token': getAsaasApiKey(),
      },
    });

    console.log('PIX QR response:', responseQr.data);

    const payment_id = uuid.v4();
 const lotteries  = await pool.query(
  'SELECT * FROM lotteries WHERE drawn_ticket IS NULL'
 )
    // Salvar pagamento no banco de dados
    await pool.query(
      'INSERT INTO payments (id, user_id, amount, status, asaas_payment_id, lottery_id) VALUES ($1, $2, $3, $4, $5, $6)',
      [payment_id, req.user.id, value, 'pending', response.data.id, lotteries.rows[0].id]
    );

    // Salvar tickets com o payment_id
    const ticketPromises = tickets.map(ticket =>
      pool.query(
        'UPDATE tickets SET user_id = $1, numbers = $2, status = $3, payment_id = $4 WHERE id = $5',
        [req.user.id, ticket.numbers, 'pending', payment_id, ticket.id]
      )
    );
    await Promise.all(ticketPromises);

    res.json({ ...response.data, ...responseQr.data });
  } catch (error) {
    console.error('Erro ao criar cobrança PIX:', error.response?.data || error.message, error.stack);
    res.status(500).json({ error: 'Erro ao criar cobrança PIX' });
  }
});

router.get('/check-payment-status/:paymentId', async (req, res) => {
  const { paymentId } = req.params;

  try {
    const response = await axios.get(`${getAsaasApiUrl()}/payments/${paymentId}`, {
      headers: {
        'access_token': getAsaasApiKey(),
      },
    });

    const paymentStatus = response.data.status;
if(paymentStatus != 'RECEIVED'){
  return res.status(400).json({ error: 'Pagamento pendente!' });
}
    // Atualizar status do pagamento no banco de dados
    const payments = await pool.query(
      'UPDATE payments SET status = $1 WHERE asaas_payment_id = $2 returning payments.id',
      [paymentStatus, paymentId]
    );

    // Atualizar status dos tickets associados ao pagamento
    await pool.query(
      'UPDATE tickets SET status = $1 WHERE payment_id = $2',
      [paymentStatus === 'RECEIVED' ? 'paid' : 'available', payments.rows[0].id]
    );

    res.json({ status: paymentStatus });
  } catch (error) {
    console.error('Erro ao verificar status do pagamento:', error.message, error.stack);
    res.status(500).json({ error: 'Erro ao verificar status do pagamento' });
  }
});

module.exports = router;
