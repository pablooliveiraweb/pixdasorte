// paymentsController.js
const createPixCharge = async (req, res) => {
  const { customer, value, tickets } = req.body;

  if (!customer || !value) {
    return res.status(400).json({ error: 'Customer and value are required' });
  }

  try {
    // Lógica para criar cobrança PIX usando a API do Asaas
    const response = await axios.post(
      'https://www.asaas.com/api/v3/payments',
      {
        customer,
        billingType: 'PIX',
        value,
        dueDate: new Date().toISOString().split('T')[0], // Data de vencimento para hoje
        description: `Compra de ${tickets.length} bilhetes`,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          access_token: process.env.ASAAS_API_KEY,
        },
      }
    );

    res.status(201).json(response.data);
  } catch (error) {
    console.error('Erro ao criar cobrança PIX:', error);
    res.status(500).json({ error: 'Erro ao criar cobrança PIX' });
  }
};

module.exports = {
  createPixCharge,
};
