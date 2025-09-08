// controller/responsavelController.js
import Responsavel from '../model/responsavelModel.js';

const responsavelController = {
  async listar(req, res) {

    console.log('Dados recebidos no backend:', responsaveis);
    try {
      const responsaveis = await Responsavel.listar();
      
      res.json(responsaveis);
    } catch (error) {
      console.error('Erro ao listar responsáveis:', error);
      res.status(500).json({ erro: 'Erro ao listar responsáveis' });
    }
  },

  async criar(req, res) {
    try {
      const dados = req.body;
      const novoId = await Responsavel.criar(dados);
      res.status(201).json({ mensagem: 'Responsável criado com sucesso', IdResponsavel: novoId });
    } catch (error) {
      console.error('Erro ao criar responsável:', error);
      res.status(500).json({ erro: 'Erro ao criar responsável' });
    }
  },

  async atualizar(req, res) {
    try {
      const id = parseInt(req.params.id);
      const dados = req.body;
      await Responsavel.atualizar(id, dados);
      res.json({ mensagem: 'Responsável atualizado com sucesso' });
    } catch (error) {
      console.error('Erro ao atualizar responsável:', error);
      res.status(500).json({ erro: 'Erro ao atualizar responsável' });
    }
  },

  async excluir(req, res) {
    try {
      const id = parseInt(req.params.id);
      await Responsavel.excluir(id);
      res.json({ mensagem: 'Responsável excluído com sucesso' });
    } catch (error) {
      console.error('Erro ao excluir responsável:', error);
      res.status(500).json({ erro: 'Erro ao excluir responsável' });
    }
  }
};

export default responsavelController;
