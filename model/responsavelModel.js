import pool from '../config/db.js';

const Responsavel = {
  async listar() {
    const [rows] = await pool.query(
      `SELECT IdResponsavel, IdEndereco, Cpf, Nome, Email, Telefone, DataNascimento, FotoUrl 
       FROM responsavel ORDER BY Nome`
    );
    return rows;
  },

  async criar(dados) {
    const [result] = await pool.query(
      `INSERT INTO responsavel (IdEndereco, Cpf, Nome, Email, Telefone, DataNascimento, FotoUrl)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        dados.IdEndereco || null,
        dados.Cpf || null,
        dados.Nome,
        dados.Email || null,
        dados.Telefone || null,
        dados.DataNascimento || null,
        dados.FotoUrl || null
      ]
    );
    return result.insertId;
  },

  async atualizar(id, dados) {
    await pool.query(
      `UPDATE responsavel SET
         IdEndereco = ?, Cpf = ?, Nome = ?, Email = ?, Telefone = ?, DataNascimento = ?, FotoUrl = ?
       WHERE IdResponsavel = ?`,
      [
        dados.IdEndereco || null,
        dados.Cpf || null,
        dados.Nome,
        dados.Email || null,
        dados.Telefone || null,
        dados.DataNascimento || null,
        dados.FotoUrl || null,
        id
      ]
    );
  },

  async excluir(id) {
    await pool.query('DELETE FROM responsavel WHERE IdResponsavel = ?', [id]);
  }
};

export default Responsavel;
