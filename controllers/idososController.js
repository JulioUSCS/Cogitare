// controller/idososController.js
import Idoso from '../models/idosoModel.js';

const idososController = {
  async listar(req, res) {
    try {
      const idosos = await Idoso.listar();
      res.json({ success: true, data: idosos });
    } catch (error) {
      console.error('Erro ao listar idosos:', error);
      res.status(500).json({ success: false, message: 'Erro ao listar idosos' });
    }
  },

  async criar(req, res) {
    try {
      const IdAdministrador = req.session.usuario?.id;
      if (!IdAdministrador) return res.status(401).json({ erro: 'Administrador não autenticado' });

      const dados = { ...req.body, IdAdministrador };
      await Idoso.criar(dados);
      res.status(201).json({ mensagem: 'Idoso criado com sucesso' });
    } catch (error) {
      console.error('Erro ao criar idoso:', error);
      res.status(500).json({ erro: 'Erro ao criar idoso' });
    }
  },

  async atualizar(req, res) {
    try {
      const IdAdministrador = req.session.usuario?.id;
      if (!IdAdministrador) return res.status(401).json({ erro: 'Administrador não autenticado' });

      const dados = { ...req.body, IdAdministrador };
      const id = parseInt(req.params.id);
      await Idoso.atualizar(id, dados);
      res.json({ mensagem: 'Idoso atualizado com sucesso' });
    } catch (error) {
      console.error('Erro ao atualizar idoso:', error);
      res.status(500).json({ erro: 'Erro ao atualizar idoso' });
    }
  },

  async excluir(req, res) {
    try {
      const IdAdministrador = req.session.usuario?.id || 1;
      const id = parseInt(req.params.id);
      await Idoso.excluir(id, IdAdministrador);
      res.json({ mensagem: 'Idoso e todos os registros relacionados foram excluídos com sucesso' });
    } catch (error) {
      console.error('Erro ao excluir idoso:', error);
      res.status(500).json({ erro: error.message || 'Erro ao excluir idoso' });
    }
  },

  async listarMobilidade(req, res) {
    try {
      const mobilidade = await Idoso.listarMobilidade();
      res.json({ success: true, data: mobilidade });
    } catch (error) {
      console.error('Erro ao listar mobilidade:', error);
      res.status(500).json({ success: false, message: 'Erro ao listar mobilidade' });
    }
  },

  async listarNivelAutonomia(req, res) {
    try {
      const niveis = await Idoso.listarNivelAutonomia();
      res.json({ success: true, data: niveis });
    } catch (error) {
      console.error('Erro ao listar nível de autonomia:', error);
      res.status(500).json({ success: false, message: 'Erro ao listar nível de autonomia' });
    }
  },

  async listarResponsavel(req, res) {
    try {
      const responsaveis = await Idoso.listarResponsavel();
      res.json({ success: true, data: responsaveis });
    } catch (error) {
      console.error('Erro ao listar responsáveis:', error);
      res.status(500).json({ success: false, message: 'Erro ao listar responsáveis' });
    }
  }
};

export default idososController;
