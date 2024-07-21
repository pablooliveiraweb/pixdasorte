const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();
const pool = require('../config/db');
const axios = require('axios');
require('dotenv').config();

const ASAAS_API_KEY = process.env.ASAAS_API_KEY;
const ASAAS_API_URL = process.env.ASAAS_API_URL;

const createAsaasCustomer = async (user) => {
  try {
    const response = await axios.post(
      `${ASAAS_API_URL}/customers`,
      {
        name: user.name,
        email: user.email,
        cpfCnpj: user.cpf, // ou user.cnpj
        phone: user.phone,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'access_token': ASAAS_API_KEY,
        }
      }
    );

    return response.data.id; // Retorna o ID do cliente criado no Asaas
  } catch (error) {
    console.error('Erro ao criar cliente no Asaas:', error.response.data);
    throw error;
  }
};

router.post('/register', async (req, res) => {
  const { name, email, phone, cpf, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    // Criar cliente no Asaas
    const asaasCustomerId = await createAsaasCustomer({ name, email, cpf, phone });

    const newUser = await pool.query(
      'INSERT INTO users (name, email, phone, cpf, password, asaas_customer_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [name, email, phone, cpf, hashedPassword, asaasCustomerId]
    );

    const token = jwt.sign({ id: newUser.rows[0].id, asaasCustomerId: newUser.rows[0].asaas_customer_id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.status(201).json({ token });
  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    res.status(500).json({ error: 'Erro ao registrar usuário' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (user.rows.length === 0) {
      return res.status(400).json({ error: 'Usuário não encontrado' });
    }

    const validPassword = await bcrypt.compare(password, user.rows[0].password);

    if (!validPassword) {
      return res.status(400).json({ error: 'Senha inválida' });
    }

    const token = jwt.sign(
      { id: user.rows[0].id, asaasCustomerId: user.rows[0].asaas_customer_id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token });
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
});

module.exports = router;
