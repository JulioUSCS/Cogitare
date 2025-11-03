import pool from '../config/db.js';

class PagamentoModel {
    // Lista todos os pagamentos com informações relacionadas
    static async listar() {
        const [result] = await pool.execute('CALL sp_pagamento_listar()');
        return result[0];
    }

    // Busca um pagamento específico por ID
    static async buscarPorId(id) {
        const [result] = await pool.execute('CALL sp_pagamento_buscar_por_id(?)', [id]);
        return result[0] ? result[0][0] : null;
    }

    // Busca pagamentos por responsável
    static async buscarPorResponsavel(idResponsavel) {
        const [result] = await pool.execute('CALL sp_pagamento_buscar_por_responsavel(?)', [idResponsavel]);
        return result[0];
    }

    // Busca pagamentos por status
    static async buscarPorStatus(status) {
        const [result] = await pool.execute('CALL sp_pagamento_buscar_por_status(?)', [status]);
        return result[0];
    }

    // Cria um novo pagamento
    static async criar(dadosPagamento) {
        const { IdAtendimento, MetodoPagamento, StatusPagamento, CodigoTransacao } = dadosPagamento;
        const [result] = await pool.execute('CALL sp_pagamento_criar(?, ?, ?, ?)', [
            IdAtendimento, MetodoPagamento, StatusPagamento, CodigoTransacao
        ]);
        return result[0] && result[0][0] ? result[0][0].Id : null;
    }

    // Atualiza um pagamento existente
    static async atualizar(id, dadosPagamento) {
        const { MetodoPagamento, StatusPagamento, CodigoTransacao } = dadosPagamento;
        await pool.execute('CALL sp_pagamento_atualizar(?, ?, ?, ?)', [
            id, MetodoPagamento, StatusPagamento, CodigoTransacao
        ]);
        return { message: 'Pagamento atualizado com sucesso' };
    }

    // Exclui um pagamento
    static async excluir(id) {
        await pool.execute('CALL sp_pagamento_excluir(?)', [id]);
        return { message: 'Pagamento excluído com sucesso' };
    }

    // Criar pagamento automaticamente quando atendimento for concluído
    static async criarPagamentoAutomatico(IdAtendimento) {
        try {
            const [result] = await pool.execute('CALL sp_pagamento_criar_automatico(?)', [IdAtendimento]);
            const id = result[0] && result[0][0] ? result[0][0].Id : null;
            
            return {
                success: true,
                message: 'Pagamento criado automaticamente',
                id: id
            };
        } catch (error) {
            console.error('Erro ao criar pagamento automático:', error);
            return { 
                success: false, 
                message: error.message || 'Erro ao criar pagamento automático' 
            };
        }
    }
}

export default PagamentoModel;
