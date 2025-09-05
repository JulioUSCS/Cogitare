const mysql = require('mysql2/promise');
const dbConfig = require('../config/db');
const Usuario = require('../model/usuarioModel');

const usuarioController = {
    async login(req, res) {
        const { usuario, senha } = req.body;

        try {
            const usuarioLogado = await Usuario.validarLogin(usuario, senha);
            if (usuarioLogado) {
                req.session.usuario = {
                    id: usuarioLogado.id,
                    nome: usuarioLogado.nome,
                    tipo: usuarioLogado.tipo,
                    loginTime: Date.now()
                };
                res.json({ sucesso: true, redirectUrl: '/view/index.html' });
            } else {
                res.json({ sucesso: false, mensagem: 'Usuário ou senha inválidos.' });
            }
        } catch (error) {
            console.error('Erro no login:', error);
            res.status(500).json({ sucesso: false, mensagem: 'Erro interno no servidor.' });
        }
    },

    async logout(req, res) {
        try {
            const idAdm = req.session.usuario?.id;
            if (idAdm) {
                const connection = await mysql.createConnection(dbConfig);
                await connection.execute(
                    'INSERT INTO HistoricoAdministrador (IdAdministrador, Operacao, DataOperacao) VALUES (?, ?, NOW())',
                    [idAdm, 'Logout']
                );
                await connection.end();
            }

            req.session.destroy(err => {
                if (err) {
                    console.error('Erro ao destruir sessão:', err);
                    return res.status(500).json({ sucesso: false, mensagem: 'Erro ao encerrar sessão' });
                }   
                res.redirect('/view/login.html?logout=true');
            });
        } catch (error) {
            console.error('Erro no logout:', error);
            res.status(500).json({ sucesso: false, mensagem: 'Erro no logout' });
        }
    }
};

module.exports = usuarioController;