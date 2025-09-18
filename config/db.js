import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_SERVER,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 3, // Reduzido de 10 para 3
  queueLimit: 10, // Adicionado limite de fila
  idleTimeout: 300000, // 5 minutos para fechar conexões idle
  // Removidas opções não suportadas pelo mysql2
});

export default pool;
