// src/config/db.js : pool MySQL + helper de transaction
//   const db = require('../config/db');
//   await db.query('SELECT ...', [params]);
//   await db.transaction(async (conn) => { await conn.query(...); });   // tout ou rien
require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'spray_info',
  waitForConnections: true,
  connectionLimit: 10,
  dateStrings: true, // les dates restent "2026-10-31" (pas de décalage de fuseau)
});

pool.transaction = async (fn) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const resultat = await fn(conn);
    await conn.commit();
    return resultat;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

module.exports = pool;
