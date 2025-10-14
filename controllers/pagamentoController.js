import PagamentoModel from '../models/pagamentoModel.js';

export const getPagamentos = async (req, res) => {
  try {
    const pagamentos = await PagamentoModel.listar();
    
    res.json({
      success: true,
      data: pagamentos
    });
    
  } catch (error) {
    console.error('Erro ao buscar pagamentos:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

export const getPagamentoPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const pagamento = await PagamentoModel.buscarPorId(id);
    
    if (!pagamento) {
      return res.status(404).json({
        success: false,
        message: 'Pagamento não encontrado'
      });
    }
    
    res.json({
      success: true,
      data: pagamento
    });
    
  } catch (error) {
    console.error('Erro ao buscar pagamento:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

export const getPagamentosPorResponsavel = async (req, res) => {
  try {
    const { idResponsavel } = req.params;
    const pagamentos = await PagamentoModel.buscarPorResponsavel(idResponsavel);
    
    res.json({
      success: true,
      data: pagamentos
    });
    
  } catch (error) {
    console.error('Erro ao buscar pagamentos do responsável:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

export const getPagamentosPorStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const pagamentos = await PagamentoModel.buscarPorStatus(status);
    
    res.json({
      success: true,
      data: pagamentos
    });
    
  } catch (error) {
    console.error('Erro ao buscar pagamentos por status:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};
