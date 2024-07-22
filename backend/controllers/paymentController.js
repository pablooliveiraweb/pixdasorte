// paymentController.js

const pool = require('../config/db');

const handlePayment = async (req, res) => {
  const { ticketId } = req.body;

  try {
    await pool.query(
      'UPDATE tickets SET status = $1 WHERE id = $2',
      ['paid', ticketId]
    );
    res.json({ message: 'Pagamento realizado com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar status do bilhete:', error);
    res.status(500).json({ message: 'Erro ao atualizar status do bilhete' });
  }
};

module.exports = { handlePayment };
