
require('dotenv').config();
const mysql = require('mysql2/promise');
const dbConfig = require('./config/db');

async function testarConexao() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log('Conexão ao MySQL realizada com sucesso!');
    await connection.end();
  } catch (error) {
    console.error('Erro na conexão:', error);
  }
}

testarConexao();