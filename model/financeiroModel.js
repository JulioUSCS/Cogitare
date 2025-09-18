// model/financeiroModel.js
import db from '../config/db.js';

class FinanceiroModel {
    // ========== RECEITAS ==========
    
    // Criar nova receita
    async criarReceita(receita) {
        const { IdAtendimento, IdResponsavel, Valor, FormaPagamento, Observacoes } = receita;
        
        const query = `
            INSERT INTO receita (IdAtendimento, IdResponsavel, Valor, FormaPagamento, Observacoes)
            VALUES (?, ?, ?, ?, ?)
        `;
        
        try {
            const [result] = await db.execute(query, [IdAtendimento, IdResponsavel, Valor, FormaPagamento, Observacoes]);
            return { success: true, id: result.insertId };
        } catch (error) {
            console.error('Erro ao criar receita:', error);
            return { success: false, message: 'Erro ao criar receita' };
        }
    }

    // Buscar receitas por período
    async buscarReceitasPorPeriodo(dataInicio, dataFim) {
        const query = `
            SELECT 
                r.IdReceita,
                r.Valor,
                r.DataRecebimento,
                r.FormaPagamento,
                r.Status,
                r.Observacoes,
                resp.Nome as NomeResponsavel,
                a.Descricao as DescricaoAtendimento
            FROM receita r
            LEFT JOIN responsavel resp ON r.IdResponsavel = resp.IdResponsavel
            LEFT JOIN atendimento a ON r.IdAtendimento = a.IdAtendimento
            WHERE DATE(r.DataRecebimento) BETWEEN ? AND ?
            ORDER BY r.DataRecebimento DESC
        `;
        
        try {
            const [rows] = await db.execute(query, [dataInicio, dataFim]);
            return { success: true, data: rows };
        } catch (error) {
            console.error('Erro ao buscar receitas por período:', error);
            return { success: false, message: 'Erro ao buscar receitas por período' };
        }
    }

    // ========== DESPESAS ==========
    
    // Criar nova despesa
    async criarDespesa(despesa) {
        const { TipoDespesa, Categoria, Descricao, Valor, IdCuidador, Comprovante, Observacoes } = despesa;
        
        const query = `
            INSERT INTO despesa (TipoDespesa, Categoria, Descricao, Valor, IdCuidador, Comprovante, Observacoes)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        
        try {
            const [result] = await db.execute(query, [TipoDespesa, Categoria, Descricao, Valor, IdCuidador, Comprovante, Observacoes]);
            return { success: true, id: result.insertId };
        } catch (error) {
            console.error('Erro ao criar despesa:', error);
            return { success: false, message: 'Erro ao criar despesa' };
        }
    }

    // Buscar despesas por período
    async buscarDespesasPorPeriodo(dataInicio, dataFim) {
        const query = `
            SELECT 
                d.IdDespesa,
                d.TipoDespesa,
                d.Categoria,
                d.Descricao,
                d.Valor,
                d.DataDespesa,
                d.Status,
                d.Comprovante,
                c.Nome as NomeCuidador
            FROM despesa d
            LEFT JOIN cuidador c ON d.IdCuidador = c.IdCuidador
            WHERE DATE(d.DataDespesa) BETWEEN ? AND ?
            ORDER BY d.DataDespesa DESC
        `;
        
        try {
            const [rows] = await db.execute(query, [dataInicio, dataFim]);
            return { success: true, data: rows };
        } catch (error) {
            console.error('Erro ao buscar despesas por período:', error);
            return { success: false, message: 'Erro ao buscar despesas por período' };
        }
    }

    // ========== COMISSÕES ==========
    
    // Calcular comissão para um atendimento
    async calcularComissao(IdAtendimento, IdCuidador) {
        // Buscar valor do atendimento
        const atendimentoQuery = `
            SELECT a.Valor, a.DataInicio
            FROM atendimento a
            WHERE a.IdAtendimento = ? AND a.IdCuidador = ?
        `;
        
        try {
            const [atendimento] = await db.execute(atendimentoQuery, [IdAtendimento, IdCuidador]);
            
            if (atendimento.length === 0) {
                return { success: false, message: 'Atendimento não encontrado' };
            }
            
            const valorAtendimento = atendimento[0].Valor;
            
            // Buscar percentual de comissão
            const configQuery = `SELECT Valor FROM configuracaofinanceira WHERE Chave = 'percentual_comissao_padrao'`;
            const [config] = await db.execute(configQuery);
            const percentualComissao = parseFloat(config[0]?.Valor || 70.00);
            
            const valorComissao = (valorAtendimento * percentualComissao) / 100;
            
            // Verificar se já existe comissão para este atendimento
            const existeQuery = `SELECT IdComissao FROM comissao WHERE IdAtendimento = ?`;
            const [existe] = await db.execute(existeQuery, [IdAtendimento]);
            
            if (existe.length > 0) {
                return { success: false, message: 'Comissão já calculada para este atendimento' };
            }
            
            // Inserir comissão
            const insertQuery = `
                INSERT INTO comissao (IdCuidador, IdAtendimento, ValorBase, PercentualComissao, ValorComissao, ValorTotal)
                VALUES (?, ?, ?, ?, ?, ?)
            `;
            
            const [result] = await db.execute(insertQuery, [
                IdCuidador, IdAtendimento, valorAtendimento, 
                percentualComissao, valorComissao, valorComissao
            ]);
            
            return { success: true, id: result.insertId, valorComissao };
        } catch (error) {
            console.error('Erro ao calcular comissão:', error);
            return { success: false, message: 'Erro ao calcular comissão' };
        }
    }

    // Buscar comissões por período
    async buscarComissoesPorPeriodo(dataInicio, dataFim) {
        const query = `
            SELECT 
                c.IdComissao,
                c.ValorBase,
                c.PercentualComissao,
                c.ValorComissao,
                c.Bonificacao,
                c.ValorTotal,
                c.DataCalculo,
                c.DataPagamento,
                c.Status,
                cu.Nome as NomeCuidador,
                a.Descricao as DescricaoAtendimento
            FROM comissao c
            LEFT JOIN cuidador cu ON c.IdCuidador = cu.IdCuidador
            LEFT JOIN atendimento a ON c.IdAtendimento = a.IdAtendimento
            WHERE DATE(c.DataCalculo) BETWEEN ? AND ?
            ORDER BY c.DataCalculo DESC
        `;
        
        try {
            const [rows] = await db.execute(query, [dataInicio, dataFim]);
            return { success: true, data: rows };
        } catch (error) {
            console.error('Erro ao buscar comissões por período:', error);
            return { success: false, message: 'Erro ao buscar comissões por período' };
        }
    }

    // ========== INADIMPLÊNCIA ==========
    
    // Verificar inadimplência
    async verificarInadimplencia() {
        const query = `
            SELECT 
                a.IdAtendimento,
                a.IdResponsavel,
                a.Valor,
                a.DataInicio,
                r.Nome as NomeResponsavel,
                r.Email,
                r.Telefone,
                DATEDIFF(CURDATE(), a.DataInicio) as DiasAtraso
            FROM atendimento a
            LEFT JOIN responsavel r ON a.IdResponsavel = r.IdResponsavel
            WHERE a.Status = 'Concluído' 
            AND a.Valor > 0
            AND DATEDIFF(CURDATE(), a.DataInicio) > 5
            AND NOT EXISTS (
                SELECT 1 FROM receita rec 
                WHERE rec.IdAtendimento = a.IdAtendimento 
                AND rec.Status = 'Pago'
            )
            AND NOT EXISTS (
                SELECT 1 FROM inadimplencia i 
                WHERE i.IdAtendimento = a.IdAtendimento
            )
        `;
        
        try {
            const [rows] = await db.execute(query);
            return { success: true, data: rows };
        } catch (error) {
            console.error('Erro ao verificar inadimplência:', error);
            return { success: false, message: 'Erro ao verificar inadimplência' };
        }
    }

    // Buscar inadimplência por período
    async buscarInadimplenciaPorPeriodo(dataInicio, dataFim) {
        const query = `
            SELECT 
                i.IdInadimplencia,
                i.ValorDevido,
                i.DataVencimento,
                i.DiasAtraso,
                i.Status,
                i.TentativasCobranca,
                i.UltimaTentativa,
                r.Nome as NomeResponsavel,
                r.Email,
                r.Telefone,
                a.Descricao as DescricaoAtendimento
            FROM inadimplencia i
            LEFT JOIN responsavel r ON i.IdResponsavel = r.IdResponsavel
            LEFT JOIN atendimento a ON i.IdAtendimento = a.IdAtendimento
            WHERE DATE(i.DataVencimento) BETWEEN ? AND ?
            ORDER BY i.DiasAtraso DESC
        `;
        
        try {
            const [rows] = await db.execute(query, [dataInicio, dataFim]);
            return { success: true, data: rows };
        } catch (error) {
            console.error('Erro ao buscar inadimplência por período:', error);
            return { success: false, message: 'Erro ao buscar inadimplência por período' };
        }
    }

    // ========== DASHBOARD FINANCEIRO ==========
    
    // Buscar estatísticas financeiras
    async buscarEstatisticasFinanceiras(dataInicio, dataFim) {
        const query = `
            SELECT 
                (SELECT COALESCE(SUM(Valor), 0) FROM receita 
                 WHERE DATE(DataRecebimento) BETWEEN ? AND ? AND Status = 'Pago') as TotalReceitas,
                
                (SELECT COALESCE(SUM(Valor), 0) FROM despesa 
                 WHERE DATE(DataDespesa) BETWEEN ? AND ? AND Status = 'Pago') as TotalDespesas,
                
                (SELECT COALESCE(SUM(ValorTotal), 0) FROM comissao 
                 WHERE DATE(DataCalculo) BETWEEN ? AND ? AND Status = 'Pago') as TotalComissoes,
                
                (SELECT COALESCE(SUM(ValorDevido), 0) FROM inadimplencia 
                 WHERE Status = 'Em Atraso') as TotalInadimplencia,
                
                (SELECT COUNT(*) FROM receita 
                 WHERE DATE(DataRecebimento) BETWEEN ? AND ? AND Status = 'Pago') as QtdReceitas,
                
                (SELECT COUNT(*) FROM despesa 
                 WHERE DATE(DataDespesa) BETWEEN ? AND ? AND Status = 'Pago') as QtdDespesas,
                
                (SELECT COUNT(*) FROM inadimplencia 
                 WHERE Status = 'Em Atraso') as QtdInadimplencia
        `;
        
        try {
            const [rows] = await db.execute(query, [
                dataInicio, dataFim, // TotalReceitas
                dataInicio, dataFim, // TotalDespesas  
                dataInicio, dataFim, // TotalComissoes
                // TotalInadimplencia (sem parâmetros)
                dataInicio, dataFim, // QtdReceitas
                dataInicio, dataFim, // QtdDespesas
                // QtdInadimplencia (sem parâmetros)
            ]);
            return { success: true, data: rows[0] };
        } catch (error) {
            console.error('Erro ao buscar estatísticas financeiras:', error);
            return { success: false, message: 'Erro ao buscar estatísticas financeiras' };
        }
    }

    // Buscar receitas por mês (últimos 12 meses)
    async buscarReceitasPorMes() {
        const query = `
            SELECT 
                DATE_FORMAT(DataRecebimento, '%Y-%m') as Mes,
                SUM(Valor) as TotalReceitas,
                COUNT(*) as QtdReceitas
            FROM receita 
            WHERE DataRecebimento >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
            AND Status = 'Pago'
            GROUP BY DATE_FORMAT(DataRecebimento, '%Y-%m')
            ORDER BY Mes ASC
        `;
        
        try {
            const [rows] = await db.execute(query);
            return { success: true, data: rows };
        } catch (error) {
            console.error('Erro ao buscar receitas por mês:', error);
            return { success: false, message: 'Erro ao buscar receitas por mês' };
        }
    }

    // Buscar despesas por categoria
    async buscarDespesasPorCategoria(dataInicio, dataFim) {
        const query = `
            SELECT 
                Categoria,
                SUM(Valor) as TotalDespesas,
                COUNT(*) as QtdDespesas
            FROM despesa 
            WHERE DATE(DataDespesa) BETWEEN ? AND ?
            AND Status = 'Pago'
            GROUP BY Categoria
            ORDER BY TotalDespesas DESC
        `;
        
        try {
            const [rows] = await db.execute(query, [dataInicio, dataFim]);
            return { success: true, data: rows };
        } catch (error) {
            console.error('Erro ao buscar despesas por categoria:', error);
            return { success: false, message: 'Erro ao buscar despesas por categoria' };
        }
    }

    // Buscar cuidadores mais rentáveis
    async buscarCuidadoresMaisRentaveis(dataInicio, dataFim) {
        const query = `
            SELECT 
                c.IdCuidador,
                c.Nome,
                COUNT(a.IdAtendimento) as QtdAtendimentos,
                SUM(a.Valor) as TotalReceitas,
                AVG(a.Valor) as MediaAtendimento,
                SUM(com.ValorTotal) as TotalComissoes
            FROM cuidador c
            LEFT JOIN atendimento a ON c.IdCuidador = a.IdCuidador
            LEFT JOIN comissao com ON a.IdAtendimento = com.IdAtendimento
            WHERE DATE(a.DataInicio) BETWEEN ? AND ?
            AND a.Status = 'Concluído'
            GROUP BY c.IdCuidador, c.Nome
            ORDER BY TotalReceitas DESC
            LIMIT 10
        `;
        
        try {
            const [rows] = await db.execute(query, [dataInicio, dataFim]);
            return { success: true, data: rows };
        } catch (error) {
            console.error('Erro ao buscar cuidadores mais rentáveis:', error);
            return { success: false, message: 'Erro ao buscar cuidadores mais rentáveis' };
        }
    }

    // ========== METAS FINANCEIRAS ==========
    
    // Buscar metas financeiras
    async buscarMetasFinanceiras() {
        const query = `
            SELECT 
                IdMeta,
                TipoMeta,
                Descricao,
                ValorMeta,
                ValorAtual,
                DataInicio,
                DataFim,
                Status,
                ROUND((ValorAtual / ValorMeta) * 100, 2) as PercentualAlcancado
            FROM metafinanceira
            WHERE Status = 'Ativa'
            ORDER BY DataFim ASC
        `;
        
        try {
            const [rows] = await db.execute(query);
            return { success: true, data: rows };
        } catch (error) {
            console.error('Erro ao buscar metas financeiras:', error);
            return { success: false, message: 'Erro ao buscar metas financeiras' };
        }
    }

    // Atualizar progresso das metas
    async atualizarProgressoMetas() {
        try {
            // Atualizar meta de receita mensal
            const receitaQuery = `
                UPDATE metafinanceira 
                SET ValorAtual = (
                    SELECT COALESCE(SUM(Valor), 0) 
                    FROM receita 
                    WHERE DATE(DataRecebimento) >= DATE_FORMAT(CURDATE(), '%Y-%m-01')
                    AND DATE(DataRecebimento) <= LAST_DAY(CURDATE())
                    AND Status = 'Pago'
                )
                WHERE TipoMeta = 'Receita' AND Status = 'Ativa'
            `;
            
            await db.execute(receitaQuery);
            
            // Atualizar meta de lucro mensal
            const lucroQuery = `
                UPDATE metafinanceira 
                SET ValorAtual = (
                    SELECT COALESCE(SUM(Valor), 0) 
                    FROM receita 
                    WHERE DATE(DataRecebimento) >= DATE_FORMAT(CURDATE(), '%Y-%m-01')
                    AND DATE(DataRecebimento) <= LAST_DAY(CURDATE())
                    AND Status = 'Pago'
                ) - (
                    SELECT COALESCE(SUM(Valor), 0) 
                    FROM despesa 
                    WHERE DATE(DataDespesa) >= DATE_FORMAT(CURDATE(), '%Y-%m-01')
                    AND DATE(DataDespesa) <= LAST_DAY(CURDATE())
                    AND Status = 'Pago'
                )
                WHERE TipoMeta = 'Lucro' AND Status = 'Ativa'
            `;
            
            await db.execute(lucroQuery);
            
            return { success: true };
        } catch (error) {
            console.error('Erro ao atualizar progresso das metas:', error);
            return { success: false, message: 'Erro ao atualizar progresso das metas' };
        }
    }
}

export default new FinanceiroModel();
