const express = require('express');
const axios = require('axios');
const router = express.Router();
require('dotenv').config();

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


router.post('/create-pix-charge', async (req, res) => {
  const { customer, value } = req.body;

  console.log('Received request to create PIX charge');
  console.log('Customer:', customer);
  console.log('Value:', value);

  if (!customer || !value) {
    console.error('Customer and value are required');
    return res.status(400).json({ error: 'Customer and value are required' });
  }

  try {
    const payload = {
      customer: customer,
      billingType: 'PIX',
      value: value,
      dueDate: new Date().toISOString().slice(0, 10), // Data de vencimento
      description: 'Compra de bilhetes',
      externalReference: 'Ref123',
    };

    console.log('Creating PIX charge with payload:', payload);

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

    console.log('PIX charge created:', response.data);

    const responseQr = await axios.get(urlQr(response.data.id), {
      headers: {
        'Content-Type': 'application/json',
        access_token: getAsaasApiKey(),
      },
    });
    console.log(responseQr.data);

    res.json({...response.data, ...responseQr.data});
  } catch (error) {
    console.error('Erro ao criar cobrança PIX:', error.response?.data || error.message);
    res.status(500).json({ error: 'Erro ao criar cobrança PIX' });
  }
});

module.exports = router;
