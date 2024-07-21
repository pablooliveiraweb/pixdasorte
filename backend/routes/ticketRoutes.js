const express = require('express');
const router = express.Router();
const pool = require('../config/db');

router.get('/:cpf', async (req, res) => {
  const { cpf } = req.params;
  try {
    const tickets = await pool.query('SELECT * FROM tickets WHERE cpf = $1', [cpf]);
    res.json(tickets.rows);
  } catch (error) {
    console.error('Erro ao buscar bilhetes:', error);
    res.status(500).json({ error: 'Erro ao buscar bilhetes' });
  }
});

module.exports = router;
