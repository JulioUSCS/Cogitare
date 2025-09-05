const mysql = require('mysql2/promise');
const dbConfig = require('../config/db');

const Idoso = {
    async listar() {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute('SELECT * FROM Idoso');
        await connection.end();
        return rows;
    },

    async criar(dados) {
        const connection = await mysql.createConnection(dbConfig);
        
        // Inserir o idoso
        const [result] = await connection.execute(
            `INSERT INTO Idoso (IdResponsavel, IdMobilidade, IdNivelAutonomia, Nome, DataNascimento, Sexo, CuidadosMedicos, DescricaoExtra, FotoUrl) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [dados.IdResponsavel, dados.IdMobilidade, dados.IdNivelAutonomia, dados.Nome, dados.DataNascimento, dados.Sexo, dados.CuidadosMedicos, dados.DescricaoExtra, dados.FotoUrl]
        );

        const novoIdIdoso = result.insertId;

        // Inserir no histórico do administrador
        await connection.execute(
            'INSERT INTO HistoricoAdministrador (IdAdministrador, Operacao, DataOperacao) VALUES (?, ?, NOW())',
            [dados.IdAdministrador, `Idoso ${dados.Nome} (ID ${novoIdIdoso}) criado.`]
        );

        await connection.end();
        return novoIdIdoso;
    },

    async atualizar(id, dados) {
        const connection = await mysql.createConnection(dbConfig);
        
        // Atualizar o idoso
        await connection.execute(
            `UPDATE Idoso SET 
                IdResponsavel = ?, IdMobilidade = ?, IdNivelAutonomia = ?, Nome = ?, 
                DataNascimento = ?, Sexo = ?, CuidadosMedicos = ?, DescricaoExtra = ?, FotoUrl = ?
             WHERE IdIdoso = ?`,
            [dados.IdResponsavel, dados.IdMobilidade, dados.IdNivelAutonomia, dados.Nome, dados.DataNascimento, dados.Sexo, dados.CuidadosMedicos, dados.DescricaoExtra, dados.FotoUrl, id]
        );

        // Inserir no histórico do administrador
        await connection.execute(
            'INSERT INTO HistoricoAdministrador (IdAdministrador, Operacao, DataOperacao) VALUES (?, ?, NOW())',
            [dados.IdAdministrador, `Idoso ${dados.Nome} (ID ${id}) alterado.`]
        );

        await connection.end();
    },

    async excluir(id) {
        const connection = await mysql.createConnection(dbConfig);
        await connection.execute('DELETE FROM Idoso WHERE IdIdoso = ?', [id]);
        await connection.end();
    },

    async listarResponsavel() {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute('SELECT IdResponsavel, Nome FROM Responsavel ORDER BY Nome');
        await connection.end();
        return rows;
    },

    async listarMobilidade() {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute('SELECT * FROM Mobilidade ORDER BY Descricao');
        await connection.end();
        return rows;
    },

    async listarNivelAutonomia() {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute('SELECT * FROM NivelAutonomia ORDER BY Descricao');
        await connection.end();
        return rows;
    }
};

module.exports = Idoso;
