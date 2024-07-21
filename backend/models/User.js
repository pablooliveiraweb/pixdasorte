const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const createUserTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) NOT NULL,
        email VARCHAR(50) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        cpf VARCHAR(20),
        pix VARCHAR(50)
      )
    `);
    console.log('Users table created successfully.');
  } catch (error) {
    console.error('Error creating users table:', error);
  }
};

module.exports = { createUserTable };
