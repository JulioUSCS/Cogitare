// model/idosoModel.js
import pool from '../config/db.js';

const Idoso = {
  async listar() {
    const [rows] = await pool.query('SELECT * FROM idoso');
    console.log(rows);
    return rows;

  },

  async criar(dados) {
    const [result] = await pool.query(
      `INSERT INTO idoso (IdResponsavel, IdMobilidade, IdNivelAutonomia, Nome, DataNascimento, Sexo, CuidadosMedicos, DescricaoExtra, FotoUrl) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        dados.IdResponsavel,
        dados.IdMobilidade,
        dados.IdNivelAutonomia,
        dados.Nome,
        dados.DataNascimento,
        dados.Sexo,
        dados.CuidadosMedicos,
        dados.DescricaoExtra,
        dados.FotoUrl
      ]
    );

    const novoIdIdoso = result.insertId;

    // Inserir no histórico do administrador
    await pool.query(
      'INSERT INTO historicoadministrador (IdAdministrador, Operacao, DataOperacao) VALUES (?, ?, NOW())',
      [dados.IdAdministrador, `Idoso ${dados.Nome} (ID ${novoIdIdoso}) criado.`]
    );

    return novoIdIdoso;
  },

  async atualizar(id, dados) {
    await pool.query(
      `UPDATE idoso SET 
          IdResponsavel = ?, IdMobilidade = ?, IdNivelAutonomia = ?, Nome = ?, 
          DataNascimento = ?, Sexo = ?, CuidadosMedicos = ?, DescricaoExtra = ?, FotoUrl = ?
       WHERE IdIdoso = ?`,
      [
        dados.IdResponsavel,
        dados.IdMobilidade,
        dados.IdNivelAutonomia,
        dados.Nome,
        dados.DataNascimento,
        dados.Sexo,
        dados.CuidadosMedicos,
        dados.DescricaoExtra,
        dados.FotoUrl,
        id
      ]
    );

    // Inserir no histórico do administrador
    await pool.query(
      'INSERT INTO historicoadministrador (IdAdministrador, Operacao, DataOperacao) VALUES (?, ?, NOW())',
      [dados.IdAdministrador, `Idoso ${dados.Nome} (ID ${id}) alterado.`]
    );
  },

  async excluir(id) {
    await pool.query('DELETE FROM idoso WHERE IdIdoso = ?', [id]);
  },

  async listarResponsavel() {
    const [rows] = await pool.query('SELECT IdResponsavel, Nome FROM responsavel ORDER BY Nome');
    return rows;
  },

  async listarMobilidade() {
    const [rows] = await pool.query('SELECT * FROM mobilidade ORDER BY Descricao');
    return rows;
  },

  async listarNivelAutonomia() {
    const [rows] = await pool.query('SELECT * FROM nivelautonomia ORDER BY Descricao');
    return rows;
  }
};

export default Idoso;
