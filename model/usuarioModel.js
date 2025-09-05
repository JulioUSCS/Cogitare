const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const dbConfig = require('../config/db');

const Usuario = {
    async validarLogin(usuario, senha) {
        try {
            const connection = await mysql.createConnection(dbConfig);
            
            // Buscar administrador pelo usuário
            const [rows] = await connection.execute(
                'SELECT IdAdministrador, Usuario, Senha, Tipo, UltimoAcesso FROM Administrador WHERE Usuario = ?',
                [usuario]
            );

            const admin = rows[0];

            if (!admin) {
                await connection.end();
                return null;
            }

            const senhaValida = await bcrypt.compare(senha, admin.Senha);
            if (!senhaValida) {
                await connection.end();
                return null;
            }

            // Atualizar último acesso
            await connection.execute(
                'UPDATE Administrador SET UltimoAcesso = NOW() WHERE IdAdministrador = ?',
                [admin.IdAdministrador]
            );

            // Inserir no histórico
            await connection.execute(
                'INSERT INTO HistoricoAdministrador (IdAdministrador, Operacao, DataOperacao) VALUES (?, ?, NOW())',
                [admin.IdAdministrador, 'Login']
            );

            await connection.end();

            return {
                id: admin.IdAdministrador,
                nome: admin.Usuario,
                tipo: admin.Tipo,
                ultimoAcesso: admin.UltimoAcesso
            };
        } catch (err) {
            throw new Error('Erro ao validar login: ' + err.message);
        }
    }
};

module.exports = Usuario;
