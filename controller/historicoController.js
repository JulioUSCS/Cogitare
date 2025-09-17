import HistoricoModel from '../model/historicoModel.js';

export const getHistorico = async (req, res) => {
    try {
        const historico = await HistoricoModel.listar();
        
        res.json({
            success: true,
            data: historico
        });
        
    } catch (error) {
        console.error('Erro ao buscar histórico:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
};

export const getHistoricoPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const historico = await HistoricoModel.buscarPorId(id);
        
        if (!historico) {
            return res.status(404).json({
                success: false,
                message: 'Registro de histórico não encontrado'
            });
        }
        
        res.json({
            success: true,
            data: historico
        });
        
    } catch (error) {
        console.error('Erro ao buscar histórico por ID:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
};

export const getHistoricoPorResponsavel = async (req, res) => {
    try {
        const { idResponsavel } = req.params;
        
        // Se não há ID, buscar todos os responsáveis
        if (!idResponsavel) {
            const historico = await HistoricoModel.buscarTodosResponsaveis();
            return res.json({
                success: true,
                data: historico
            });
        }
        
        // Se há ID, buscar por responsável específico
        const historico = await HistoricoModel.buscarPorResponsavel(idResponsavel);
        
        res.json({
            success: true,
            data: historico
        });
        
    } catch (error) {
        console.error('Erro ao buscar histórico por responsável:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
};

export const getHistoricoPorCuidador = async (req, res) => {
    try {
        const { idCuidador } = req.params;
        
        // Se não há ID, buscar todos os cuidadores
        if (!idCuidador) {
            const historico = await HistoricoModel.buscarTodosCuidadores();
            return res.json({
                success: true,
                data: historico
            });
        }
        
        // Se há ID, buscar por cuidador específico
        const historico = await HistoricoModel.buscarPorCuidador(idCuidador);
        
        res.json({
            success: true,
            data: historico
        });
        
    } catch (error) {
        console.error('Erro ao buscar histórico por cuidador:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
};

export const getHistoricoPorAdministrador = async (req, res) => {
    try {
        const { idAdministrador } = req.params;
        
        // Se não há ID, buscar todos os administradores
        if (!idAdministrador) {
            const historico = await HistoricoModel.buscarTodosAdministradores();
            return res.json({
                success: true,
                data: historico
            });
        }
        
        // Se há ID, buscar por administrador específico
        const historico = await HistoricoModel.buscarPorAdministrador(idAdministrador);
        
        res.json({
            success: true,
            data: historico
        });
        
    } catch (error) {
        console.error('Erro ao buscar histórico por administrador:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
};

export const getHistoricoPorAcao = async (req, res) => {
    try {
        const { acao } = req.params;
        const historico = await HistoricoModel.buscarPorAcao(acao);
        
        res.json({
            success: true,
            data: historico
        });
        
    } catch (error) {
        console.error('Erro ao buscar histórico por ação:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
};

export const criarHistorico = async (req, res) => {
    try {
        const dados = req.body;
        const novoHistorico = await HistoricoModel.criar(dados);
        
        res.status(201).json({
            success: true,
            message: 'Registro de histórico criado com sucesso',
            data: { id: novoHistorico }
        });
        
    } catch (error) {
        console.error('Erro ao criar histórico:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
};

export const atualizarHistorico = async (req, res) => {
    try {
        const { id } = req.params;
        const dados = req.body;
        const atualizado = await HistoricoModel.atualizar(id, dados);
        
        if (!atualizado) {
            return res.status(404).json({
                success: false,
                message: 'Registro de histórico não encontrado'
            });
        }
        
        res.json({
            success: true,
            message: 'Registro de histórico atualizado com sucesso'
        });
        
    } catch (error) {
        console.error('Erro ao atualizar histórico:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
};

export const excluirHistorico = async (req, res) => {
    try {
        const { id } = req.params;
        const excluido = await HistoricoModel.excluir(id);
        
        if (!excluido) {
            return res.status(404).json({
                success: false,
                message: 'Registro de histórico não encontrado'
            });
        }
        
        res.json({
            success: true,
            message: 'Registro de histórico excluído com sucesso'
        });
        
    } catch (error) {
        console.error('Erro ao excluir histórico:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
};

// Rota específica para histórico de atendimentos
export const getHistoricoAtendimento = async (req, res) => {
    try {
        const historico = await HistoricoModel.buscarHistoricoAtendimento();
        
        res.json({
            success: true,
            data: historico
        });
        
    } catch (error) {
        console.error('Erro ao buscar histórico de atendimentos:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
};