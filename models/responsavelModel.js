import pool from '../config/db.js';

const Responsavel = {
  async listar() {
    const [result] = await pool.execute('CALL sp_responsavel_listar()');
    return result[0];
  },

  async criar(dados) {
    const { IdEndereco, Cpf, Nome, Email, Telefone, DataNascimento, FotoUrl, IdAdministrador } = dados;
    const adminId = IdAdministrador || 1;
    
    const [result] = await pool.execute('CALL sp_responsavel_criar(?, ?, ?, ?, ?, ?, ?, ?)', [
      IdEndereco || null,
      Cpf || null,
      Nome,
      Email || null,
      Telefone || null,
      DataNascimento || null,
      FotoUrl || null,
      adminId
    ]);
    // SELECT LAST_INSERT_ID() AS Id -> fica em result[0][0].Id
    return result[0] && result[0][0] ? result[0][0].Id : null;
  },

  async atualizar(id, dados) {
    const { IdEndereco, Cpf, Nome, Email, Telefone, DataNascimento, FotoUrl, IdAdministrador } = dados;
    const adminId = IdAdministrador || 1;
    
    await pool.execute('CALL sp_responsavel_atualizar(?, ?, ?, ?, ?, ?, ?, ?, ?)', [
      id,
      IdEndereco || null,
      Cpf || null,
      Nome,
      Email || null,
      Telefone || null,
      DataNascimento || null,
      FotoUrl || null,
      adminId
    ]);
  },

  async excluir(id, IdAdministrador = 1) {
    await pool.execute('CALL sp_responsavel_excluir(?, ?)', [id, IdAdministrador]);
  }
};

export default Responsavel;
