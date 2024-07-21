const pool = require('../config/db');
const uuid = require('uuid');
const bcrypt = require('bcryptjs');
const generateToken = require('../utils/generateToken');

const registerUser = async (req, res) => {
  const { name, email, phone, cpf, pix, password } = req.body;
  const id = uuid.v4();
  const hashedPassword = await bcrypt.hash(password, 10);

  const queryText = `
    INSERT INTO users(id, name, email, phone, cpf, pix, password)
    VALUES($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `;
  try {
    const { rows } = await pool.query(queryText, [id, name, email, phone, cpf, pix, hashedPassword]);
    res.status(201).json({
      ...rows[0],
      token: generateToken(rows[0].id),
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  const queryText = 'SELECT * FROM users WHERE email = $1';
  try {
    const { rows } = await pool.query(queryText, [email]);
    const user = rows[0];

    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        ...user,
        token: generateToken(user.id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = { registerUser, loginUser };
