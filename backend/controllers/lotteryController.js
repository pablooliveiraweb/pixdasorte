const pool = require('../config/db');

const createLottery = async (req, res) => {
  const { name, startDate, endDate, ticketQuantity } = req.body;
  const image = req.file ? req.file.filename : null;

  try {
    console.log('Dados recebidos:', { name, startDate, endDate, ticketQuantity, image });
    const result = await pool.query(
      'INSERT INTO lotteries (name, start_date, end_date, ticket_quantity, image) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, startDate, endDate, ticketQuantity, image]
    );

    const lottery = result.rows[0];
    const tickets = new Set();

    while (tickets.size < ticketQuantity) {
      const ticketNumber = Math.floor(Math.random() * 90000) + 10000;
      tickets.add(ticketNumber);
    }

    for (const ticketNumber of tickets) {
      await pool.query(
        'INSERT INTO tickets (lottery_id, ticket_number) VALUES ($1, $2)',
        [lottery.id, ticketNumber]
      );
    }

    res.status(201).json({ lottery, tickets: Array.from(tickets) });
  } catch (error) {
    console.error('Erro ao criar sorteio:', error);
    res.status(500).json({ message: 'Erro ao criar sorteio' });
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

  if (password !== process.env.DRAW_PASSWORD) {
    return res.status(401).json({ message: 'Senha incorreta' });
  }

  try {
    const lotteryResult = await pool.query('SELECT * FROM lotteries WHERE id = $1', [id]);
    const lottery = lotteryResult.rows[0];

    if (!lottery) {
      return res.status(404).json({ message: 'Sorteio não encontrado' });
    }

    if (lottery.drawn_ticket) {
      return res.status(400).json({ message: 'Sorteio já realizado' });
    }

    const ticketsResult = await pool.query('SELECT * FROM tickets WHERE lottery_id = $1', [id]);
    const tickets = ticketsResult.rows;

    if (tickets.length === 0) {
      return res.status(400).json({ message: 'Nenhum bilhete para sortear' });
    }

    const drawnTicket = tickets[Math.floor(Math.random() * tickets.length)];
    const drawDate = new Date().toISOString();

    await pool.query(
      'UPDATE lotteries SET drawn_ticket = $1, draw_date = $2 WHERE id = $3',
      [drawnTicket.ticket_number, drawDate, id]
    );

    res.status(200).json({ drawnTicket, drawDate });
  } catch (error) {
    console.error('Erro ao realizar sorteio:', error);
    res.status(500).json({ message: 'Erro ao realizar sorteio' });
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
};
