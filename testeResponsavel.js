import pool from './config/db.js';

async function testarResponsavel() {
  try {
    const [rows] = await pool.query(`
      SELECT IdResponsavel, Nome, Email, Telefone, Cpf, DataNascimento, FotoUrl
      FROM responsavel
      ORDER BY Nome
    `);

    console.log('\n=== RESULTADO DO SELECT RESPONSAVEL ===');
    if (rows.length === 0) {
      console.log('Nenhum registro encontrado.');
    } else {
      rows.forEach(r => {
        console.log(`ID: ${r.IdResponsavel} | Nome: ${r.Nome} | Email: ${r.Email} | Telefone: ${r.Telefone}`);
      });
    }
    console.log('======================================\n');
  } catch (err) {
    console.error('Erro ao consultar responsavel:', err);
  } finally {
    // Fecha o pool
    await pool.end();
  }
}

// Executa a função
testarResponsavel();
