import pool from './config/db.js';

async function testarConexao() {
  try {
    const [rows] = await pool.query('SELECT NOW() AS hora_atual');
    console.log('Conexão bem sucedida!', rows[0].hora_atual);
  } catch (err) {
    console.error('Erro de conexão:', err.message);
  }
}

testarConexao();
