const pool = require('../config/db');
const uuid = require('uuid');

const createLottery = async (req, res) => {
  const { prize, drawn_numbers } = req.body;
  const id = uuid.v4();

  const queryText = `
    INSERT INTO lotteries(id, prize, drawn_numbers)
    VALUES(, , )
    RETURNING *
  `;
  try {
    const { rows } = await pool.query(queryText, [id, prize, drawn_numbers]);
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = { createLottery };