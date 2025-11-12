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

export const criarPagamento = async (req, res) => {
  try {
    const { IdAtendimento, MetodoPagamento, StatusPagamento, CodigoTransacao } = req.body || {};

    if (!IdAtendimento || !MetodoPagamento || !StatusPagamento) {
      return res.status(400).json({
        success: false,
        message: 'IdAtendimento, MetodoPagamento e StatusPagamento são obrigatórios.'
      });
    }

    const novoPagamentoId = await PagamentoModel.criar({
      IdAtendimento,
      MetodoPagamento,
      StatusPagamento,
      CodigoTransacao
    });

    res.status(201).json({
      success: true,
      message: 'Pagamento criado com sucesso.',
      data: { IdPagamento: novoPagamentoId }
    });
  } catch (error) {
    console.error('Erro ao criar pagamento:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

export const atualizarPagamento = async (req, res) => {
  try {
    const { id } = req.params;
    const { MetodoPagamento, StatusPagamento, CodigoTransacao } = req.body || {};

    if (!MetodoPagamento || !StatusPagamento) {
      return res.status(400).json({
        success: false,
        message: 'MetodoPagamento e StatusPagamento são obrigatórios.'
      });
    }

    await PagamentoModel.atualizar(id, {
      MetodoPagamento,
      StatusPagamento,
      CodigoTransacao
    });

    res.json({
      success: true,
      message: 'Pagamento atualizado com sucesso.'
    });
  } catch (error) {
    console.error('Erro ao atualizar pagamento:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

export const excluirPagamento = async (req, res) => {
  try {
    const { id } = req.params;

    await PagamentoModel.excluir(id);

    res.json({
      success: true,
      message: 'Pagamento excluído com sucesso.'
    });
  } catch (error) {
    console.error('Erro ao excluir pagamento:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};
