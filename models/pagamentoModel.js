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
            // Verificar se já existe pagamento para este atendimento
            const [pagamentoExistente] = await pool.query(`
                SELECT IdPagamento FROM pagamento WHERE IdAtendimento = ?
            `, [IdAtendimento]);

            if (pagamentoExistente.length > 0) {
                return { 
                    success: false, 
                    message: 'Pagamento já existe para este atendimento' 
                };
            }

            // Buscar dados do atendimento
            const [atendimentoRows] = await pool.query(`
                SELECT IdAtendimento, Valor, DataInicio
                FROM atendimento 
                WHERE IdAtendimento = ? AND Status = 'Concluído'
            `, [IdAtendimento]);

            if (atendimentoRows.length === 0) {
                return { 
                    success: false, 
                    message: 'Atendimento não encontrado ou não concluído' 
                };
            }

            const atendimento = atendimentoRows[0];

            // Definir método de pagamento padrão e status
            const metodoPagamento = 'Dinheiro'; // Padrão
            const statusPagamento = 'Pago'; // Assumir que foi pago quando concluído
            const codigoTransacao = `AUTO-${IdAtendimento}-${Date.now()}`;
            const dataPagamento = new Date(); // Data atual

            // Criar pagamento
            const [result] = await pool.query(`
                INSERT INTO pagamento (IdAtendimento, MetodoPagamento, StatusPagamento, DataPagamento, CodigoTransacao)
                VALUES (?, ?, ?, ?, ?)
            `, [IdAtendimento, metodoPagamento, statusPagamento, dataPagamento, codigoTransacao]);

            return {
                success: true,
                message: 'Pagamento criado automaticamente',
                id: result.insertId
            };
        } catch (error) {
            console.error('Erro ao criar pagamento automático:', error);
            return { 
                success: false, 
                message: 'Erro ao criar pagamento automático' 
            };
        }
    }
}

export default PagamentoModel;
