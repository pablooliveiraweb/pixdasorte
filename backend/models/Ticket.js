const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const createTicketTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tickets (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id),
        numbers VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Tickets table created successfully.');
  } catch (error) {
    console.error('Error creating tickets table:', error);
  }
};

module.exports = { createTicketTable };
