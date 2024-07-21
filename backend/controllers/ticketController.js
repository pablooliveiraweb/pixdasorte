const pool = require('../config/db');
const uuid = require('uuid');

const buyTicket = async (req, res) => {
  const { numbers } = req.body;
  const user_id = req.user.id;
  const id = uuid.v4();

  const queryText = `
    INSERT INTO tickets(id, user_id, numbers)
    VALUES($1, $2, $3)
    RETURNING *
  `;
  try {
    const { rows } = await pool.query(queryText, [id, user_id, numbers]);
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = { buyTicket };
