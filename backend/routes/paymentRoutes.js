const express = require('express');
const axios = require('axios');
const router = express.Router();
require('dotenv').config();

const ASAAS_API_KEY = process.env.ASAAS_API_KEY;
const ASAAS_API_URL = process.env.ASAAS_API_URL;

router.post('/create-pix-charge', async (req, res) => {
  const { customer, value } = req.body;

  if (!customer || !value) {
    return res.status(400).json({ error: 'Customer and value are required' });
  }

  try {
    const response = await axios.post(
      `${ASAAS_API_URL}/payments`,
      {
        customer: customer,
        billingType: 'PIX',
        value: value,
        dueDate: new Date().toISOString().slice(0, 10), // Data de vencimento
        description: 'Compra de bilhetes',
        externalReference: 'Ref123',
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'access_token': ASAAS_API_KEY,
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('Erro ao criar cobrança PIX:', error.response.data);
    res.status(500).json({ error: 'Erro ao criar cobrança PIX' });
  }
});

module.exports = router;
