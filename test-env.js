const { Pool } = require('pg');
require('dotenv').config();

const databaseUrl = process.env.DATABASE_URL;

const pool = new Pool({
  connectionString: databaseUrl,
});

const testConnection = async () => {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('Connection successful:', res.rows[0]);
  } catch (error) {
    console.error('Error connecting to the database:', error);
  } finally {
    pool.end();
  }
};

testConnection();
