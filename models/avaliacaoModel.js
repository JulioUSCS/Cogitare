// model/avaliacaoModel.js
import pool from '../config/db.js';

class AvaliacaoModel {
    // Criar nova avaliação
    async criarAvaliacao(avaliacao) {
        const { IdResponsavel, IdCuidador, IdAtendimento, Nota, Comentario, IdAdministrador } = avaliacao;
        const adminId = IdAdministrador || 1;
        
        try {
            const [result] = await pool.execute(
                'CALL sp_avaliacao_criar(?, ?, ?, ?, ?, ?)',
                [IdResponsavel, IdCuidador, IdAtendimento, Nota, Comentario, adminId]
            );
            const id = result[0] && result[0][0] ? result[0][0].Id : null;
            return { success: true, id };
        } catch (error) {
            console.error('Erro ao criar avaliação:', error);
            return { success: false, message: 'Erro ao criar avaliação' };
        }
    }

    // Buscar todas as avaliações
    async buscarTodasAvaliacoes() {
        try {
            const [result] = await pool.execute('CALL sp_avaliacao_listar()');
            return { success: true, data: result[0] };
        } catch (error) {
            console.error('Erro ao buscar avaliações:', error);
            return { success: false, message: 'Erro ao buscar avaliações' };
        }
    }

    // Buscar avaliações por cuidador
    async buscarAvaliacoesPorCuidador(IdCuidador) {
        try {
            const [result] = await pool.execute('CALL sp_avaliacao_buscar_por_cuidador(?)', [IdCuidador]);
            return { success: true, data: result[0] };
        } catch (error) {
            console.error('Erro ao buscar avaliações do cuidador:', error);
            return { success: false, message: 'Erro ao buscar avaliações do cuidador' };
        }
    }

    // Buscar avaliações por responsável
    async buscarAvaliacoesPorResponsavel(IdResponsavel) {
        try {
            const [result] = await pool.execute('CALL sp_avaliacao_buscar_por_responsavel(?)', [IdResponsavel]);
            return { success: true, data: result[0] };
        } catch (error) {
            console.error('Erro ao buscar avaliações do responsável:', error);
            return { success: false, message: 'Erro ao buscar avaliações do responsável' };
        }
    }

    // Calcular média de avaliações por cuidador
    async calcularMediaCuidador(IdCuidador) {
        try {
            const [result] = await pool.execute('CALL sp_avaliacao_calcular_media_cuidador(?)', [IdCuidador]);
            return { success: true, data: result[0] && result[0][0] ? result[0][0] : null };
        } catch (error) {
            console.error('Erro ao calcular média do cuidador:', error);
            return { success: false, message: 'Erro ao calcular média do cuidador' };
        }
    }

    // Buscar estatísticas gerais
    async buscarEstatisticas() {
        try {
            const [result] = await pool.execute('CALL sp_avaliacao_estatisticas()');
            return { success: true, data: result[0] && result[0][0] ? result[0][0] : null };
        } catch (error) {
            console.error('Erro ao buscar estatísticas:', error);
            return { success: false, message: 'Erro ao buscar estatísticas' };
        }
    }

    // Buscar atendimentos disponíveis para avaliação
    async buscarAtendimentosParaAvaliacao(IdResponsavel) {
        try {
            const [result] = await pool.execute('CALL sp_avaliacao_buscar_atendimentos_para_avaliacao(?)', [IdResponsavel]);
            return { success: true, data: result[0] };
        } catch (error) {
            console.error('Erro ao buscar atendimentos para avaliação:', error);
            return { success: false, message: 'Erro ao buscar atendimentos para avaliação' };
        }
    }

    // Verificar se atendimento já foi avaliado
    async verificarAvaliacaoExistente(IdAtendimento) {
        try {
            const [result] = await pool.execute('CALL sp_avaliacao_verificar_existente(?)', [IdAtendimento]);
            const existe = result[0] && result[0][0] ? result[0][0].ExisteAvaliacao === 1 : false;
            return { success: true, data: existe };
        } catch (error) {
            console.error('Erro ao verificar avaliação existente:', error);
            return { success: false, message: 'Erro ao verificar avaliação existente' };
        }
    }

    // Atualizar avaliação
    async atualizarAvaliacao(IdAvaliacao, dados) {
        const { Nota, Comentario, IdAdministrador } = dados;
        const adminId = IdAdministrador || 1;
        
        try {
            await pool.execute('CALL sp_avaliacao_atualizar(?, ?, ?, ?)', [IdAvaliacao, Nota, Comentario, adminId]);
            return { success: true };
        } catch (error) {
            console.error('Erro ao atualizar avaliação:', error);
            return { success: false, message: 'Erro ao atualizar avaliação' };
        }
    }

    // Excluir avaliação
    async excluirAvaliacao(IdAvaliacao, IdAdministrador = 1) {
        try {
            await pool.execute('CALL sp_avaliacao_excluir(?, ?)', [IdAvaliacao, IdAdministrador]);
            return { success: true };
        } catch (error) {
            console.error('Erro ao excluir avaliação:', error);
            return { success: false, message: 'Erro ao excluir avaliação' };
        }
    }
}

export default new AvaliacaoModel();
