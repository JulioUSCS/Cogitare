// controller/usuarioController.js
import pool from '../config/db.js';
import Usuario from '../model/usuarioModel.js';

const usuarioController = {
  async getSessao(req, res) {
    try {
      if (req.session.usuario) {
        res.json({
          success: true,
          usuario: req.session.usuario
        });
      } else {
        res.status(401).json({
          success: false,
          message: 'Usuário não autenticado'
        });
      }
    } catch (error) {
      console.error('Erro ao buscar sessão:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  },

  async login(req, res) {
    const { usuario, senha } = req.body;

    try {
      const usuarioLogado = await Usuario.validarLogin(usuario, senha);

      if (usuarioLogado) {
        req.session.usuario = {
          id: usuarioLogado.id,
          usuario: usuarioLogado.usuario,
          nome: usuarioLogado.nome,
          email: usuarioLogado.email,
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
        await pool.query(
          'INSERT INTO historicoadministrador (IdAdministrador, Operacao, DataOperacao) VALUES (?, ?, NOW())',
          [idAdm, 'Logout']
        );
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

export default usuarioController;
