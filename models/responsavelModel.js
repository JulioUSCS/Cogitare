import pool from '../config/db.js';

const Responsavel = {
  async listar() {
    const [result] = await pool.execute('CALL sp_responsavel_listar()');
    return result[0];
  },

  async criar(dados) {
    const [result] = await pool.execute('CALL sp_responsavel_criar(?, ?, ?, ?, ?, ?, ?)', [
      dados.IdEndereco || null,
      dados.Cpf || null,
      dados.Nome,
      dados.Email || null,
      dados.Telefone || null,
      dados.DataNascimento || null,
      dados.FotoUrl || null
    ]);
    // SELECT LAST_INSERT_ID() AS Id -> fica em result[0][0].Id
    return result[0] && result[0][0] ? result[0][0].Id : null;
  },

  async atualizar(id, dados) {
    await pool.execute('CALL sp_responsavel_atualizar(?, ?, ?, ?, ?, ?, ?, ?)', [
      id,
      dados.IdEndereco || null,
      dados.Cpf || null,
      dados.Nome,
      dados.Email || null,
      dados.Telefone || null,
      dados.DataNascimento || null,
      dados.FotoUrl || null
    ]);
  },

  async excluir(id) {
    await pool.execute('CALL sp_responsavel_excluir(?)', [id]);
  }
};

export default Responsavel;
