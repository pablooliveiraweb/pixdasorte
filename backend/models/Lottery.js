const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const createLotteryTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS lotteries (
        id SERIAL PRIMARY KEY,
        winning_numbers VARCHAR(255) NOT NULL,
        prize DECIMAL NOT NULL,
        drawn_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Lotteries table created successfully.');
  } catch (error) {
    console.error('Error creating lotteries table:', error);
  }
};

module.exports = { createLotteryTable };
