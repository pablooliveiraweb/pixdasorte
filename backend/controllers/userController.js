const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const axios = require('axios');

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      asaascustomerid: user.asaascustomerid,
      cpf: user.cpf,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '1h',
    }
  );
};

const createAsaasCustomer = async (name, email, cpf, phone) => {
  try {
    const response = await axios.post(
      'https://www.asaas.com/api/v3/customers',
      {
        name,
        email,
        cpfCnpj: cpf,
        phone,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          access_token: process.env.ASAAS_API_KEY,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Erro ao criar cliente no Asaas:', error);
    throw new Error('Erro ao criar cliente no Asaas');
  }
};

const registerUser = async (req, res) => {
  const { name, email, password, cpf, phone } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const asaasCustomer = await createAsaasCustomer(name, email, cpf, phone);
    const asaasCustomerId = asaasCustomer.id;

    const result = await pool.query(
      'INSERT INTO users (name, email, password, cpf, phone, asaasCustomerId) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [name, email, hashedPassword, cpf, phone, asaasCustomerId]
    );

    const user = result.rows[0];
    const token = generateToken(user);
    res.status(201).json({ token });
  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    res.status(500).json({ message: 'Erro ao registrar usuário' });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (user && (await bcrypt.compare(password, user.password))) {
      const token = generateToken(user);
      res.json({ token });
    } else {
      res.status(401).json({ message: 'Credenciais inválidas' });
    }
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    res.status  .json({ message: 'Erro ao fazer login' });
  }
};

const getUsers = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users');
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao obter usuários:', error);
    res.status(500).json({ message: 'Erro ao obter usuários' });
  }
};

const updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, email, is_admin } = req.body;

  try {
    const result = await pool.query(
      'UPDATE users SET name = $1, email = $2, is_admin = $3 WHERE id = $4 RETURNING *',
      [name, email, is_admin, id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({ message: 'Erro ao atualizar usuário' });
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query('DELETE FROM users WHERE id = $1', [id]);
    res.json({ message: 'Usuário excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir usuário:', error);
    res.status(500).json({ message: 'Erro ao excluir usuário' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUsers,
  updateUser,
  deleteUser,
};
