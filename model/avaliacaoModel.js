// model/avaliacaoModel.js
import db from '../config/db.js';

class AvaliacaoModel {
    // Criar nova avaliação
    async criarAvaliacao(avaliacao) {
        const { IdResponsavel, IdCuidador, IdAtendimento, Nota, Comentario } = avaliacao;
        
        const query = `
            INSERT INTO avaliacao (IdResponsavel, IdCuidador, IdAtendimento, Nota, Comentario)
            VALUES (?, ?, ?, ?, ?)
        `;
        
        try {
            const [result] = await db.execute(query, [IdResponsavel, IdCuidador, IdAtendimento, Nota, Comentario]);
            return { success: true, id: result.insertId };
        } catch (error) {
            console.error('Erro ao criar avaliação:', error);
            return { success: false, message: 'Erro ao criar avaliação' };
        }
    }

    // Buscar todas as avaliações
    async buscarTodasAvaliacoes() {
        const query = `
            SELECT 
                a.IdAvaliacao,
                a.Nota,
                a.Comentario,
                a.DataAvaliacao,
                r.Nome as NomeResponsavel,
                c.Nome as NomeCuidador,
                at.DataInicio,
                at.DataFim,
                i.Nome as NomeIdoso
            FROM avaliacao a
            LEFT JOIN responsavel r ON a.IdResponsavel = r.IdResponsavel
            LEFT JOIN cuidador c ON a.IdCuidador = c.IdCuidador
            LEFT JOIN atendimento at ON a.IdAtendimento = at.IdAtendimento
            LEFT JOIN idoso i ON at.IdIdoso = i.IdIdoso
            ORDER BY a.DataAvaliacao DESC
        `;
        
        try {
            const [rows] = await db.execute(query);
            return { success: true, data: rows };
        } catch (error) {
            console.error('Erro ao buscar avaliações:', error);
            return { success: false, message: 'Erro ao buscar avaliações' };
        }
    }

    // Buscar avaliações por cuidador
    async buscarAvaliacoesPorCuidador(IdCuidador) {
        const query = `
            SELECT 
                a.IdAvaliacao,
                a.Nota,
                a.Comentario,
                a.DataAvaliacao,
                r.Nome as NomeResponsavel,
                at.DataInicio,
                at.DataFim,
                i.Nome as NomeIdoso
            FROM avaliacao a
            LEFT JOIN responsavel r ON a.IdResponsavel = r.IdResponsavel
            LEFT JOIN atendimento at ON a.IdAtendimento = at.IdAtendimento
            LEFT JOIN idoso i ON at.IdIdoso = i.IdIdoso
            WHERE a.IdCuidador = ?
            ORDER BY a.DataAvaliacao DESC
        `;
        
        try {
            const [rows] = await db.execute(query, [IdCuidador]);
            return { success: true, data: rows };
        } catch (error) {
            console.error('Erro ao buscar avaliações do cuidador:', error);
            return { success: false, message: 'Erro ao buscar avaliações do cuidador' };
        }
    }

    // Buscar avaliações por responsável
    async buscarAvaliacoesPorResponsavel(IdResponsavel) {
        const query = `
            SELECT 
                a.IdAvaliacao,
                a.Nota,
                a.Comentario,
                a.DataAvaliacao,
                c.Nome as NomeCuidador,
                at.DataInicio,
                at.DataFim,
                i.Nome as NomeIdoso
            FROM avaliacao a
            LEFT JOIN cuidador c ON a.IdCuidador = c.IdCuidador
            LEFT JOIN atendimento at ON a.IdAtendimento = at.IdAtendimento
            LEFT JOIN idoso i ON at.IdIdoso = i.IdIdoso
            WHERE a.IdResponsavel = ?
            ORDER BY a.DataAvaliacao DESC
        `;
        
        try {
            const [rows] = await db.execute(query, [IdResponsavel]);
            return { success: true, data: rows };
        } catch (error) {
            console.error('Erro ao buscar avaliações do responsável:', error);
            return { success: false, message: 'Erro ao buscar avaliações do responsável' };
        }
    }

    // Calcular média de avaliações por cuidador
    async calcularMediaCuidador(IdCuidador) {
        const query = `
            SELECT 
                AVG(Nota) as MediaNota,
                COUNT(*) as TotalAvaliacoes
            FROM avaliacao 
            WHERE IdCuidador = ?
        `;
        
        try {
            const [rows] = await db.execute(query, [IdCuidador]);
            return { success: true, data: rows[0] };
        } catch (error) {
            console.error('Erro ao calcular média do cuidador:', error);
            return { success: false, message: 'Erro ao calcular média do cuidador' };
        }
    }

    // Buscar estatísticas gerais
    async buscarEstatisticas() {
        const query = `
            SELECT 
                COUNT(*) as TotalAvaliacoes,
                AVG(Nota) as MediaGeral,
                MIN(Nota) as MenorNota,
                MAX(Nota) as MaiorNota,
                COUNT(CASE WHEN Nota >= 4 THEN 1 END) as AvaliacoesPositivas,
                COUNT(CASE WHEN Nota <= 2 THEN 1 END) as AvaliacoesNegativas
            FROM avaliacao
        `;
        
        try {
            const [rows] = await db.execute(query);
            return { success: true, data: rows[0] };
        } catch (error) {
            console.error('Erro ao buscar estatísticas:', error);
            return { success: false, message: 'Erro ao buscar estatísticas' };
        }
    }

    // Buscar atendimentos disponíveis para avaliação
    async buscarAtendimentosParaAvaliacao(IdResponsavel) {
        const query = `
            SELECT 
                a.IdAtendimento,
                a.DataInicio,
                a.DataFim,
                c.Nome as NomeCuidador,
                i.Nome as NomeIdoso,
                CASE WHEN av.IdAvaliacao IS NOT NULL THEN 1 ELSE 0 END as JaAvaliado
            FROM atendimento a
            LEFT JOIN cuidador c ON a.IdCuidador = c.IdCuidador
            LEFT JOIN idoso i ON a.IdIdoso = i.IdIdoso
            LEFT JOIN avaliacao av ON a.IdAtendimento = av.IdAtendimento
            WHERE a.IdResponsavel = ? 
            AND a.Status = 'Concluído'
            AND a.DataFim <= NOW()
            ORDER BY a.DataFim DESC
        `;
        
        try {
            const [rows] = await db.execute(query, [IdResponsavel]);
            return { success: true, data: rows };
        } catch (error) {
            console.error('Erro ao buscar atendimentos para avaliação:', error);
            return { success: false, message: 'Erro ao buscar atendimentos para avaliação' };
        }
    }

    // Verificar se atendimento já foi avaliado
    async verificarAvaliacaoExistente(IdAtendimento) {
        const query = `
            SELECT IdAvaliacao FROM avaliacao WHERE IdAtendimento = ?
        `;
        
        try {
            const [rows] = await db.execute(query, [IdAtendimento]);
            return { success: true, data: rows.length > 0 };
        } catch (error) {
            console.error('Erro ao verificar avaliação existente:', error);
            return { success: false, message: 'Erro ao verificar avaliação existente' };
        }
    }

    // Atualizar avaliação
    async atualizarAvaliacao(IdAvaliacao, dados) {
        const { Nota, Comentario } = dados;
        
        const query = `
            UPDATE avaliacao 
            SET Nota = ?, Comentario = ?
            WHERE IdAvaliacao = ?
        `;
        
        try {
            const [result] = await db.execute(query, [Nota, Comentario, IdAvaliacao]);
            return { success: true, affectedRows: result.affectedRows };
        } catch (error) {
            console.error('Erro ao atualizar avaliação:', error);
            return { success: false, message: 'Erro ao atualizar avaliação' };
        }
    }

    // Excluir avaliação
    async excluirAvaliacao(IdAvaliacao) {
        const query = `DELETE FROM avaliacao WHERE IdAvaliacao = ?`;
        
        try {
            const [result] = await db.execute(query, [IdAvaliacao]);
            return { success: true, affectedRows: result.affectedRows };
        } catch (error) {
            console.error('Erro ao excluir avaliação:', error);
            return { success: false, message: 'Erro ao excluir avaliação' };
        }
    }
}

export default new AvaliacaoModel();
