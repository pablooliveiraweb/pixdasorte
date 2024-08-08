const pool = require('../config/db');
const uuid = require('uuid');

const getTickets = async (req, res) => {
  const queryText = 'SELECT * FROM tickets';
  try {
    const { rows } = await pool.query(queryText);
    res.json(rows);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const getUsers = async (req, res) => {
  const queryText = 'SELECT * FROM users';
  try {
    const { rows } = await pool.query(queryText);
    res.json(rows);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const drawLottery = async (req, res) => {
  const prize = req.body.prize;
  const id = uuid.v4();
  const drawn_numbers = generateRandomNumbers(); // Implementar a função de geração de números aleatórios
  
  const queryText = `
    INSERT INTO lotteries(id, prize, drawn_numbers)
    VALUES($1, $2, $3)
    RETURNING *
  `;
  try {
    const { rows } = await pool.query(queryText, [id, prize, drawn_numbers]);
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const getLotteryResults = async (req, res) => {
  const queryText = 'SELECT * FROM lotteries';
  try {
    const { rows } = await pool.query(queryText);
    res.json(rows);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const generateRandomNumbers = () => {
  // Implementação da função para gerar números aleatórios
  return Array.from({ length: 6 }, () => Math.floor(Math.random() * 60) + 1).join(', ');
};

// Função para contar usuários cadastrados
const getUserCount = async (req, res) => {
  try {
    const result = await pool.query('SELECT COUNT(*) AS count FROM users');
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao contar usuários:', error);
    res.status(500).json({ message: 'Erro ao contar usuários.' });
  }
};

const getLotterySummary = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT l.id, l.name, COALESCE(SUM(p.amount), 0) AS totalpaidamount
      FROM lotteries l
      LEFT JOIN payments p ON l.id = p.lottery_id AND p.status = 'RECEIVED'
      GROUP BY l.id, l.name
      ORDER BY l.start_date DESC
      LIMIT 5
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao obter resumo dos sorteios:', error);
    res.status(500).json({ message: 'Erro ao obter resumo dos sorteios.' });
  }
};

const getWinners = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT l.id AS lottery_id, l.name AS lottery_name, u.name AS winner_name
      FROM lotteries l
      JOIN users u ON l.winner_user_id = u.id
      ORDER BY l.start_date DESC
      LIMIT 5
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao obter vencedores:', error);
    res.status(500).json({ message: 'Erro ao obter vencedores.' });
  }
};

const getFinishedLotteries = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT l.id, l.name AS lottery_name, l.end_date, l.drawn_ticket, u.name AS winner_name, l.prize
      FROM lotteries l
      JOIN users u ON l.winner_user_id = u.id
      WHERE l.drawn_ticket IS NOT NULL
      ORDER BY l.end_date DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar resultados dos sorteios:', error);
    res.status(500).json({ message: 'Erro ao buscar resultados dos sorteios.' });
  }
};

module.exports = { 
  getTickets, 
  getUsers, 
  drawLottery, 
  getUserCount,
  getLotterySummary,
  getWinners, 
  getFinishedLotteries,
};
