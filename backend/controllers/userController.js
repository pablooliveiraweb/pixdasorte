const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const pool = require('../config/db');

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      name: user.name,
      asaasCustomerId: user.asaasCustomerId
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '1h'
    }
  );
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (user && (await bcrypt.compare(password, user.password))) {
      const token = generateToken(user);
      res.json({ token });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const register = async (req, res) => {
  const { name, email, password, cpf, phone } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (name, email, password, cpf, phone) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, email, hashedPassword, cpf, phone]
    );

    const user = result.rows[0];
    const token = generateToken(user);
    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  login,
  register
};
