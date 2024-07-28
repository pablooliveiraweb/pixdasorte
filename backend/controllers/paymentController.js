const axios = require('axios');

const createPixCharge = async (req, res) => {
  const { customer, value, tickets } = req.body;

  if (!customer || !value) {
    return res.status(400).json({ error: 'Customer and value are required' });
  }

  try {
    const mode = process.env.ASAAS_MODE === 'production' ? 'production' : 'sandbox';
    const apiKey = mode === 'production' ? process.env.ASAAS_API_KEY_PRODUCTION : process.env.ASAAS_API_KEY_SANDBOX;
    const url = mode === 'production' 
      ? 'https://www.asaas.com/api/v3/payments'
      : 'https://sandbox.asaas.com/api/v3/payments';

    const response = await axios.post(url, {
      customer,
      billingType: 'PIX',
      value,
      dueDate: new Date().toISOString().split('T')[0], // Data de vencimento para hoje
      description: `Compra de ${tickets.length} bilhete(s) de loteria`
    }, {
      headers: {
        'Content-Type': 'application/json',
        access_token: apiKey,
      },
    });

    res.status(200).json(response.data);
  } catch (error) {
    console.error('Erro ao criar cobrança PIX:', error);
    res.status(500).json({ message: 'Erro ao criar cobrança PIX', error: error.response ? error.response.data : error.message });
  }
};

module.exports = {
  createPixCharge
};
