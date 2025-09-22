import pool from '../config/db.js';

class PagamentoModel {
    // Lista todos os pagamentos com informações relacionadas
    static async listar() {
        const [rows] = await pool.query(`
            SELECT 
                p.IdPagamento,
                p.IdAtendimento,
                p.MetodoPagamento,
                p.StatusPagamento,
                p.DataPagamento,
                p.CodigoTransacao,
                r.Nome as NomeResponsavel,
                r.Email as EmailResponsavel,
                r.Telefone as TelefoneResponsavel,
                c.Nome as NomeCuidador,
                c.Email as EmailCuidador,
                i.Nome as NomeIdoso,
                a.DataInicio,
                a.DataFim,
                a.Valor,
                a.Status as StatusAtendimento
            FROM pagamento p
            INNER JOIN atendimento a ON p.IdAtendimento = a.IdAtendimento
            INNER JOIN responsavel r ON a.IdResponsavel = r.IdResponsavel
            INNER JOIN cuidador c ON a.IdCuidador = c.IdCuidador
            INNER JOIN idoso i ON a.IdIdoso = i.IdIdoso
            ORDER BY p.DataPagamento DESC
        `);
        return rows;
    }

    // Busca um pagamento específico por ID
    static async buscarPorId(id) {
        const [rows] = await pool.query(`
            SELECT 
                p.IdPagamento,
                p.IdAtendimento,
                p.MetodoPagamento,
                p.StatusPagamento,
                p.DataPagamento,
                p.CodigoTransacao,
                r.Nome as NomeResponsavel,
                r.Email as EmailResponsavel,
                r.Telefone as TelefoneResponsavel,
                c.Nome as NomeCuidador,
                c.Email as EmailCuidador,
                i.Nome as NomeIdoso,
                a.DataInicio,
                a.DataFim,
                a.Valor,
                a.Status as StatusAtendimento
            FROM pagamento p
            INNER JOIN atendimento a ON p.IdAtendimento = a.IdAtendimento
            INNER JOIN responsavel r ON a.IdResponsavel = r.IdResponsavel
            INNER JOIN cuidador c ON a.IdCuidador = c.IdCuidador
            INNER JOIN idoso i ON a.IdIdoso = i.IdIdoso
            WHERE p.IdPagamento = ?
        `, [id]);
        return rows[0];
    }

    // Busca pagamentos por responsável
    static async buscarPorResponsavel(idResponsavel) {
        const [rows] = await pool.query(`
            SELECT 
                p.IdPagamento,
                p.IdAtendimento,
                p.MetodoPagamento,
                p.StatusPagamento,
                p.DataPagamento,
                p.CodigoTransacao,
                r.Nome as NomeResponsavel,
                r.Email as EmailResponsavel,
                r.Telefone as TelefoneResponsavel,
                c.Nome as NomeCuidador,
                c.Email as EmailCuidador,
                i.Nome as NomeIdoso,
                a.DataInicio,
                a.DataFim,
                a.Valor,
                a.Status as StatusAtendimento
            FROM pagamento p
            INNER JOIN atendimento a ON p.IdAtendimento = a.IdAtendimento
            INNER JOIN responsavel r ON a.IdResponsavel = r.IdResponsavel
            INNER JOIN cuidador c ON a.IdCuidador = c.IdCuidador
            INNER JOIN idoso i ON a.IdIdoso = i.IdIdoso
            WHERE a.IdResponsavel = ?
            ORDER BY p.DataPagamento DESC
        `, [idResponsavel]);
        return rows;
    }

    // Busca pagamentos por status
    static async buscarPorStatus(status) {
        const [rows] = await pool.query(`
            SELECT 
                p.IdPagamento,
                p.IdAtendimento,
                p.MetodoPagamento,
                p.StatusPagamento,
                p.DataPagamento,
                p.CodigoTransacao,
                r.Nome as NomeResponsavel,
                r.Email as EmailResponsavel,
                r.Telefone as TelefoneResponsavel,
                c.Nome as NomeCuidador,
                c.Email as EmailCuidador,
                i.Nome as NomeIdoso,
                a.DataInicio,
                a.DataFim,
                a.Valor,
                a.Status as StatusAtendimento
            FROM pagamento p
            INNER JOIN atendimento a ON p.IdAtendimento = a.IdAtendimento
            INNER JOIN responsavel r ON a.IdResponsavel = r.IdResponsavel
            INNER JOIN cuidador c ON a.IdCuidador = c.IdCuidador
            INNER JOIN idoso i ON a.IdIdoso = i.IdIdoso
            WHERE p.StatusPagamento = ?
            ORDER BY p.DataPagamento DESC
        `, [status]);
        return rows;
    }

    // Cria um novo pagamento
    static async criar(dadosPagamento) {
        const { IdAtendimento, MetodoPagamento, StatusPagamento, CodigoTransacao } = dadosPagamento;
        
        const [result] = await pool.query(`
            INSERT INTO pagamento (IdAtendimento, MetodoPagamento, StatusPagamento, CodigoTransacao)
            VALUES (?, ?, ?, ?)
        `, [IdAtendimento, MetodoPagamento, StatusPagamento, CodigoTransacao]);
        
        return result.insertId;
    }

    // Atualiza um pagamento existente
    static async atualizar(id, dadosPagamento) {
        const { MetodoPagamento, StatusPagamento, CodigoTransacao } = dadosPagamento;
        
        await pool.query(`
            UPDATE pagamento 
            SET MetodoPagamento = ?, StatusPagamento = ?, CodigoTransacao = ?
            WHERE IdPagamento = ?
        `, [MetodoPagamento, StatusPagamento, CodigoTransacao, id]);
        
        return { message: 'Pagamento atualizado com sucesso' };
    }

    // Exclui um pagamento
    static async excluir(id) {
        await pool.query('DELETE FROM pagamento WHERE IdPagamento = ?', [id]);
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
