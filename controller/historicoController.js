// controller/historicoController.js
import Historico from '../model/historicoModel.js'; // caminho para seu model

const getHistoricos = async (req, res) => {
  try {
    const historicos = await Historico.listarTodosHistoricos();
    res.json({ sucesso: true, historicos });
  } catch (error) {
    console.error('Erro no controller ao buscar históricos:', error.message);
    res.status(500).json({ sucesso: false, mensagem: 'Erro interno do servidor ao buscar histórico.' });
  }
};

export default { getHistoricos }; // ← export default permite import historicoController from ...
