const mysql = require('mysql');
//const dotenv = require('dotenv');

// Load environment variables from .env file
//dotenv.config();

// Create MySQL connection pool
const pool = mysql.createPool({
  connectionLimit: 10,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWD,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT
});

// Handle errors
pool.on('error', (err) => {
  console.error('MySQL Pool Error:', err);
});

module.exports = pool;
