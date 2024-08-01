const cron = require('node-cron');
const pool = require('../config/db');
const axios = require('axios');
const { ASAAS_API_KEY_SANDBOX, ASAAS_API_KEY_PRODUCTION, ASAAS_MODE } = process.env;

const getAsaasApiKey = () => {
  return ASAAS_MODE === 'production' ? ASAAS_API_KEY_PRODUCTION : ASAAS_API_KEY_SANDBOX;
};

const getAsaasApiUrl = () => {
  return ASAAS_MODE === 'production'
    ? 'https://www.asaas.com/api/v3'
    : 'https://sandbox.asaas.com/api/v3';
};

// Função para verificar e atualizar o status dos pagamentos
const updatePaymentStatusPeriodically = async () => {
  try {
    const result = await pool.query('SELECT * FROM payments WHERE status = \'pending\'');

    for (const payment of result.rows) {
      try {
        const response = await axios.get(`${getAsaasApiUrl()}/payments/${payment.asaas_payment_id}`, {
          headers: {
            'access_token': getAsaasApiKey(),
          },
        });

        const updatedStatus = response.data.status;
        if (updatedStatus !== 'PENDING') {
          await pool.query('UPDATE payments SET status = $1 WHERE id = $2', [updatedStatus, payment.id]);
          await pool.query('UPDATE tickets SET status = $1 WHERE payment_id = $2', [updatedStatus === 'RECEIVED' ? 'paid' : 'available', payment.id]);
        }
      } catch (error) {
        console.error(`Erro ao verificar status do pagamento ${payment.id}:`, error.message);
      }
    }
  } catch (error) {
    console.error('Erro ao atualizar status dos pagamentos:', error.message);
  }
};

// Função para liberar bilhetes pendentes após 2 minutos
const releasePendingTickets = async () => {
  try {
    const result = await pool.query(
      `SELECT * FROM payments 
      WHERE status = 'pending' AND created_at < NOW() - INTERVAL '2 minutes'`
    );

    for (const payment of result.rows) {
      // Atualizar status dos tickets para 'available' e remover user_id e payment_id
      await pool.query(
        `UPDATE tickets 
         SET status = 'available', user_id = NULL, payment_id = NULL 
         WHERE payment_id = $1`,
        [payment.id]
      );
      // Excluir o pagamento
      await pool.query('DELETE FROM payments WHERE id = $1', [payment.id]);
    }
  } catch (error) {
    console.error('Erro ao liberar bilhetes pendentes:', error.message);
  }
};

// Agendar a tarefa para rodar a cada minuto para atualizar o status dos pagamentos
cron.schedule('* * * * *', updatePaymentStatusPeriodically);

// Agendar a tarefa para rodar a cada minuto para liberar bilhetes pendentes
cron.schedule('* * * * *', releasePendingTickets);

module.exports = {
  updatePaymentStatusPeriodically,
  releasePendingTickets,
};
