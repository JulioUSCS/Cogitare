// model/historicoModel.js
import pool from '../config/db.js';

const Historico = {
  async listarTodosHistoricos() {
    try {
      const [rows] = await pool.query(`
        SELECT
          HA.IdHistorico,
          HA.IdAtendimento,
          I.Nome AS NomeIdoso,
          HA.DataRegistro,
          C.Nome AS NomeProfissional,
          HA.StatusFinal,
          HA.Observacoes
        FROM
          HistoricoAtendimento AS HA
        INNER JOIN
          Atendimento AS A ON HA.IdAtendimento = A.IdAtendimento
        INNER JOIN
          Idoso AS I ON A.IdIdoso = I.IdIdoso
        INNER JOIN
          Cuidador AS C ON A.IdCuidador = C.IdCuidador
        ORDER BY
          HA.DataRegistro DESC
      `);
      return rows;
    } catch (err) {
      console.error('Erro ao listar históricos de atendimento no model:', err.message);
      throw new Error('Erro ao buscar históricos de atendimento.');
    }
  }
};

export default Historico; // ← agora compatível com ES Modules
