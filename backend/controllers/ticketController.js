const pool = require('../config/db');
const uuid = require('uuid');
const axios = require('axios');
const { ASAAS_API_KEY, ASAAS_API_URL } = process.env;

// Função para comprar bilhete
const buyTicket = async (req, res) => {
  const { tickets } = req.body; // Array de tickets [{ numbers, lottery_id }]
  const user_id = req.user.id;
  const payment_id = uuid.v4();
  const status = 'pending'; // Status inicial como pendente

  try {
    await pool.query('BEGIN');

    // Inserir pagamento
    const paymentAmount = tickets.length * 5; // Valor total dos bilhetes
    await pool.query(
      'INSERT INTO payments (id, user_id, amount, status, lottery_id) VALUES ($1, $2, $3, $4, $5)',
      [payment_id, user_id, paymentAmount, status, tickets[0].lottery_id]
    );

    // Inserir tickets
    const ticketPromises = tickets.map(ticket =>
      pool.query(
        'INSERT INTO tickets (id, user_id, numbers, status, lottery_id, payment_id) VALUES ($1, $2, $3, $4, $5, $6)',
        [uuid.v4(), user_id, ticket.numbers, status, ticket.lottery_id, payment_id]
      )
    );
    await Promise.all(ticketPromises);

    await pool.query('COMMIT');

    // Criar cobrança PIX na Asaas
    const asaasResponse = await axios.post(
      `${ASAAS_API_URL}/payments`,
      {
        customer: req.user.asaascustomerid,
        billingType: 'PIX',
        value: paymentAmount,
        dueDate: new Date(new Date().getTime() + 5 * 60000).toISOString(), // Prazo de pagamento 5 min
        description: 'Compra de bilhetes',
        externalReference: payment_id,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          access_token: ASAAS_API_KEY,
        },
      }
    );

    const paymentData = asaasResponse.data;

    // Atualizar payment_id na tabela de pagamentos
    await pool.query(
      'UPDATE payments SET asaas_payment_id = $1 WHERE id = $2',
      [paymentData.id, payment_id]
    );

    res.status(201).json({ paymentData, payment_id });
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error('Erro ao salvar bilhete:', err);
    res.status(400).json({ error: err.message });
  }
};




// Função para listar bilhetes do usuário
const getUserTickets = async (req, res) => {
  const userId = req.user.id;

  console.log('getUserTickets:', { userId });

  try {
    const result = await pool.query(
      `SELECT t.*, l.name AS lottery_name, l.image AS lottery_image, l.start_date, l.end_date, 
        l.drawn_ticket, l.winner_user_id, l.winner_name, COALESCE(p.status, 'pending') AS payment_status
      FROM tickets t
      LEFT JOIN lotteries l ON t.lottery_id = l.id
      LEFT JOIN payments p ON t.payment_id = p.id
      WHERE t.user_id = $1
      ORDER BY l.start_date DESC`,
      [userId]
    );

    console.log('User Tickets Result:', result.rows);

    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar bilhetes:', error.message);
    res.status(500).json({ message: 'Erro ao buscar bilhetes' });
  }
};



// Função para atualizar o status do bilhete
const updateTicketStatus = async (req, res) => {
  const { payment_id, status } = req.body;

  console.log('updateTicketStatus:', { payment_id, status });

  try {
    const { rows } = await pool.query(
      `UPDATE tickets SET status = $1 
      WHERE payment_id = $2 
      RETURNING *`,
      [status, payment_id]
    );
    res.json(rows);
  } catch (err) {
    console.error('Erro ao atualizar status do bilhete:', err);
    res.status(400).json({ error: err.message });
  }
};

// Função para obter bilhetes disponíveis
const getAvailableTickets = async (req, res) => {
  const { quantity } = req.params;

  try {
    const result = await pool.query(
      `SELECT t.* FROM tickets t
      JOIN lotteries l ON t.lottery_id = l.id
      WHERE t.status = 'available' AND l.drawn_ticket IS NULL
      ORDER BY RANDOM() LIMIT $1`,
      [quantity]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao obter bilhetes disponíveis:', error.message);
    res.status(500).json({ message: 'Erro ao obter bilhetes disponíveis' });
  }
};


// Função para cancelar bilhetes
const cancelTickets = async (req, res) => {
  const { paymentId } = req.body;

  try {
    await pool.query('UPDATE tickets SET status = \'canceled\' WHERE payment_id = $1', [paymentId]);
    await pool.query('UPDATE payments SET status = \'canceled\' WHERE id = $1', [paymentId]);
    res.status(200).json({ message: 'Bilhetes cancelados com sucesso' });
  } catch (error) {
    console.error('Erro ao cancelar bilhetes:', error.message);
    res.status(500).json({ error: 'Erro ao cancelar bilhetes' });
  }
};

// Função para atualizar o status dos pagamentos periodicamente
const updatePaymentStatusPeriodically = async () => {
  try {
    const result = await pool.query('SELECT * FROM payments WHERE status = \'pending\'');

    for (const payment of result.rows) {
      const response = await axios.get(`${ASAAS_API_URL}/payments/${payment.asaas_payment_id}`, {
        headers: {
          'access_token': ASAAS_API_KEY,
        },
      });

      const updatedStatus = response.data.status;
      await pool.query('UPDATE payments SET status = $1 WHERE id = $2', [updatedStatus, payment.id]);
      await pool.query('UPDATE tickets SET status = $1 WHERE payment_id = $2', [updatedStatus === 'RECEIVED' ? 'paid' : 'available', payment.id]);
    }
  } catch (error) {
    console.error('Erro ao atualizar status dos pagamentos:', error.message);
  }
};

// Atualizar o status dos pagamentos a cada 30 segundos
setInterval(updatePaymentStatusPeriodically, 30000);

module.exports = {
  buyTicket,
  getUserTickets,
  updateTicketStatus,
  getAvailableTickets,
  cancelTickets,
};
