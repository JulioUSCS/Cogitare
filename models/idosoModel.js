// model/idosoModel.js
import pool from '../config/db.js';

const Idoso = {
  async listar() {
    const [result] = await pool.execute('CALL sp_idoso_listar()');
    return result[0];
  },

  async criar(dados) {
    const { IdResponsavel, IdMobilidade, IdNivelAutonomia, Nome, DataNascimento, Sexo, CuidadosMedicos, DescricaoExtra, FotoUrl, IdAdministrador } = dados;
    const adminId = IdAdministrador || 1;
    
    const [result] = await pool.execute(
      'CALL sp_idoso_criar(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [IdResponsavel, IdMobilidade, IdNivelAutonomia, Nome, DataNascimento, Sexo, CuidadosMedicos, DescricaoExtra, FotoUrl, adminId]
    );
    
    return result[0] && result[0][0] ? result[0][0].Id : null;
  },

  async atualizar(id, dados) {
    const { IdResponsavel, IdMobilidade, IdNivelAutonomia, Nome, DataNascimento, Sexo, CuidadosMedicos, DescricaoExtra, FotoUrl, IdAdministrador } = dados;
    const adminId = IdAdministrador || 1;
    
    await pool.execute(
      'CALL sp_idoso_atualizar(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, IdResponsavel, IdMobilidade, IdNivelAutonomia, Nome, DataNascimento, Sexo, CuidadosMedicos, DescricaoExtra, FotoUrl, adminId]
    );
  },

  async excluir(id, IdAdministrador = 1) {
    await pool.execute('CALL sp_idoso_excluir(?, ?)', [id, IdAdministrador]);
  },

  async listarResponsavel() {
    const [result] = await pool.execute('CALL sp_idoso_listar_responsaveis()');
    return result[0];
  },

  async listarMobilidade() {
    const [result] = await pool.execute('CALL sp_idoso_listar_mobilidades()');
    return result[0];
  },

  async listarNivelAutonomia() {
    const [result] = await pool.execute('CALL sp_idoso_listar_niveis_autonomia()');
    return result[0];
  }
};

export default Idoso;
