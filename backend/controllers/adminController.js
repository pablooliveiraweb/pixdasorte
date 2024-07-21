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

module.exports = { getTickets, getUsers, drawLottery, getLotteryResults };
