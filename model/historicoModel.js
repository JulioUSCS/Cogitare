// model/historicoModel.js
const mysql = require('mysql2/promise');
const dbConfig = require('../config/db');

const Historico = {
    async listarTodosHistoricos() {
        try {
            const connection = await mysql.createConnection(dbConfig);
            
            const [rows] = await connection.execute(`
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
            
            await connection.end();
            return rows;
        } catch (err) {
            console.error('Erro ao listar históricos de atendimento no model:', err.message);
            throw new Error('Erro ao buscar históricos de atendimento.');
        }
    }
};

module.exports = Historico;