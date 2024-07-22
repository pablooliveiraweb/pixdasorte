const pool = require('../config/db');
const uuid = require('uuid');

// Função para comprar bilhete
const buyTicket = async (req, res) => {
  const { numbers } = req.body;
  const user_id = req.user.id;
  const id = uuid.v4();
  const status = 'pending'; // Status inicial como pendente

  console.log('buyTicket:', { id, user_id, numbers, status }); // Adicione logs

  const queryText = `
    INSERT INTO tickets(id, user_id, numbers, status)
    VALUES($1, $2, $3, $4)
    RETURNING *
  `;
  try {
    const { rows } = await pool.query(queryText, [id, user_id, numbers, status]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Erro ao salvar bilhete:', err);
    res.status(400).json({ error: err.message });
  }
};

// Função para listar bilhetes do usuário
const getUserTickets = async (req, res) => {
  const user_id = req.user.id;

  console.log('getUserTickets:', { user_id }); // Adicione logs

  try {
    const { rows } = await pool.query('SELECT * FROM tickets WHERE user_id = $1', [user_id]);
    res.json(rows);
  } catch (err) {
    console.error('Erro ao buscar bilhetes:', err);
    res.status(400).json({ error: err.message });
  }
};

// Função para atualizar o status do bilhete
const updateTicketStatus = async (req, res) => {
  const { ticketId, status } = req.body;

  console.log('updateTicketStatus:', { ticketId, status }); // Adicione logs

  const queryText = `
    UPDATE tickets
    SET status = $1
    WHERE id = $2
    RETURNING *
  `;
  try {
    const { rows } = await pool.query(queryText, [status, ticketId]);
    res.json(rows[0]);
  } catch (err) {
    console.error('Erro ao atualizar status do bilhete:', err);
    res.status(400).json({ error: err.message });
  }
};

module.exports = { buyTicket, getUserTickets, updateTicketStatus };
