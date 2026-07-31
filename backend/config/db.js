const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

// Create MySQL Connection Pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'expense_voucher_db',
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true
});

let isConnected = false;

// Function to test connectivity
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Connected to MySQL database successfully!');
    connection.release();
    isConnected = true;
    return true;
  } catch (error) {
    console.warn('⚠️  MySQL connection notice:', error.message);
    console.warn('👉 The application will utilize database access methods with error feedback if MySQL credentials require adjustment.');
    isConnected = false;
    return false;
  }
};

// Generic Async Query Executor with parameterized queries
const query = async (sql, params = []) => {
  try {
    const [rows, fields] = await pool.execute(sql, params);
    return rows;
  } catch (error) {
    console.error('SQL Execution Error:', error.message);
    throw error;
  }
};

module.exports = {
  pool,
  query,
  testConnection
};
