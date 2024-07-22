const express = require('express');
const router = express.Router();
const axios = require('axios');
const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const ASAAS_API_KEY = process.env.ASAAS_API_KEY;
const ASAAS_API_URL = process.env.ASAAS_API_URL;

const createAsaasCustomer = async (name, email, cpfCnpj, phone) => {
  try {
    const response = await axios.post(
      `${ASAAS_API_URL}/customers`,
      {
        name,
        email,
        cpfCnpj,
        phone,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'access_token': ASAAS_API_KEY,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('Erro ao criar cliente no Asaas:', error.response?.data || error.message);
    throw new Error('Erro ao criar cliente no Asaas');
  }
};

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      name: user.name,
      asaasCustomerId: user.asaasCustomerId,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '1h',
    }
  );
};

router.post('/register', async (req, res) => {
  const { name, email, password, cpf, phone } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crie o cliente no Asaas
    const asaasCustomer = await createAsaasCustomer(name, email, cpf, phone);
    console.log('Cliente Asaas criado:', asaasCustomer);

    // Salve o usuário no banco de dados
    const id = uuidv4();
    const result = await pool.query(
      'INSERT INTO users (id, name, email, password, cpf, phone, asaasCustomerId) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [id, name, email, hashedPassword, cpf, phone, asaasCustomer.id]
    );

    const user = result.rows[0];
    const token = generateToken(user);

    res.json({ token });
  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    res.status(500).json({ message: 'Erro ao registrar usuário' });
  }
});

router.post('/login', async (req, res) => {
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
});

module.exports = router;
