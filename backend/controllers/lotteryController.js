const pool = require('../config/db');
const uuid = require('uuid');

// Função para criar sorteio
const createLottery = async (req, res) => {
  const { name, startDate, endDate, ticketQuantity } = req.body;
  const image = req.file ? req.file.filename : null;

  try {
    console.log('Dados recebidos:', { name, startDate, endDate, ticketQuantity, image });
    const result = await pool.query(
      'INSERT INTO lotteries (id, name, start_date, end_date, ticket_quantity, image) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [uuid.v4(), name, startDate, endDate, ticketQuantity, image]
    );

    const lottery = result.rows[0];
    const tickets = new Set();

    while (tickets.size < ticketQuantity) {
      const ticketNumber = Math.floor(Math.random() * 90000) + 10000;
      tickets.add(ticketNumber);
    }

    for (const ticketNumber of tickets) {
      await pool.query(
        'INSERT INTO tickets (id, lottery_id, ticket_number, status) VALUES ($1, $2, $3, $4)',
        [uuid.v4(), lottery.id, ticketNumber, 'available']
      );
    }

    res.status(201).json({ lottery, tickets: Array.from(tickets) });
  } catch (error) {
    console.error('Erro ao criar sorteio:', error);
    res.status(500).json({ message: 'Erro ao criar sorteio' });
  }
};

const getActiveLottery = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM lotteries 
      WHERE drawn_ticket IS NULL 
      ORDER BY start_date DESC LIMIT 1`
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Nenhum sorteio ativo encontrado.' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar o sorteio ativo:', error.message);
    res.status(500).json({ message: 'Erro ao buscar o sorteio ativo.' });
  }
};

const getLotteries = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM lotteries');
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao obter sorteios:', error);
    res.status(500).json({ message: 'Erro ao obter sorteios' });
  }
};

const getTicketsByLotteryId = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('SELECT * FROM tickets WHERE lottery_id = $1', [id]);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao obter bilhetes:', error);
    res.status(500).json({ message: 'Erro ao obter bilhetes' });
  }
};

const drawLottery = async (req, res) => {
  const { id } = req.params;
  const { password } = req.body;

  // Verifique a senha
  if (password !== process.env.DRAW_PASSWORD) {
    return res.status(401).json({ error: 'Senha incorreta' });
  }

  try {
    // Obtenha todos os bilhetes pagos para este sorteio
    const result = await pool.query(
      'SELECT t.*, u.name AS winner_name FROM tickets t JOIN users u ON t.user_id = u.id WHERE t.lottery_id = $1 AND t.status = $2',
      [id, 'paid']
    );

    const tickets = result.rows;

    if (tickets.length === 0) {
      return res.status(400).json({ error: 'Nenhum bilhete comprado para sorteio' });
    }

    // Selecione um bilhete aleatório
    const randomIndex = Math.floor(Math.random() * tickets.length);
    const drawnTicket = tickets[randomIndex];

    // Atualize o sorteio com o bilhete sorteado e o usuário vencedor
    await pool.query(
      'UPDATE lotteries SET drawn_ticket = $1, winner_user_id = $2, winner_name = $3 WHERE id = $4',
      [drawnTicket.ticket_number, drawnTicket.user_id, drawnTicket.winner_name, id]
    );

    res.json({ drawnTicket: drawnTicket.ticket_number, winner: drawnTicket.winner_name });
  } catch (err) {
    console.error('Erro ao realizar sorteio:', err.message);
    res.status(500).json({ error: 'Erro ao realizar sorteio' });
  }
};


const deleteLottery = async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query('DELETE FROM tickets WHERE lottery_id = $1', [id]);
    await pool.query('DELETE FROM lotteries WHERE id = $1', [id]);
    res.status(200).json({ message: 'Sorteio excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir sorteio:', error);
    res.status(500).json({ message: 'Erro ao excluir sorteio' });
  }
};

module.exports = {
  createLottery,
  getLotteries,
  getTicketsByLotteryId,
  drawLottery,
  deleteLottery,
  getActiveLottery,
};