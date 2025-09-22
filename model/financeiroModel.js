// model/financeiroModel.js
import db from '../config/db.js';

class FinanceiroModel {
    // ========== RECEITAS ==========
    
    // Criar nova receita
    async criarReceita(receita) {
        const { IdAtendimento, IdResponsavel, Valor, FormaPagamento, Observacoes } = receita;
        
        try {
            // 🔒 PROTEÇÃO: Se a receita está vinculada a um atendimento, verificar se ele está concluído
            if (IdAtendimento) {
                const [atendimentoRows] = await db.execute(`
                    SELECT Status FROM atendimento WHERE IdAtendimento = ?
                `, [IdAtendimento]);
                
                if (atendimentoRows.length === 0) {
                    return { success: false, message: 'Atendimento não encontrado' };
                }
                
                const atendimento = atendimentoRows[0];
                
                // 🔒 PROTEÇÃO: Verificar se o atendimento está concluído
                if (atendimento.Status !== 'Concluído') {
                    return { 
                        success: false, 
                        message: `Não é possível criar receita para atendimento com status '${atendimento.Status}'. Apenas atendimentos 'Concluído' podem ter receitas.` 
                    };
                }
                
                // 🔒 PROTEÇÃO: Verificar se já existe receita para este atendimento
                const [receitaExistente] = await db.execute(`
                    SELECT IdReceita FROM receita WHERE IdAtendimento = ?
                `, [IdAtendimento]);
                
                if (receitaExistente.length > 0) {
                    return { success: false, message: 'Já existe uma receita para este atendimento' };
                }
            }
            
            const query = `
                INSERT INTO receita (IdAtendimento, IdResponsavel, Valor, FormaPagamento, Observacoes)
                VALUES (?, ?, ?, ?, ?)
            `;
            
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
                -- ========== MÉTRICAS DE VENDAS ==========
                -- Total de vendas (todos os atendimentos)
                (SELECT COALESCE(SUM(Valor), 0) FROM atendimento) as TotalVendas,
                
                -- Valor a receber (atendimentos não concluídos)
                (SELECT COALESCE(SUM(Valor), 0) FROM atendimento 
                 WHERE Status != 'Concluído') as ValorAReceber,
                
                -- Valor já recebido (atendimentos concluídos)
                (SELECT COALESCE(SUM(Valor), 0) FROM atendimento 
                 WHERE Status = 'Concluído') as ValorRecebido,
                
                -- ========== MÉTRICAS DE RECEITA ==========
                -- Receita total de todos os atendimentos concluídos
                (SELECT COALESCE(SUM(Valor), 0) FROM atendimento 
                 WHERE Status = 'Concluído') as ReceitaAtendimentosConcluidos,
                
                -- Receitas efetivamente recebidas (tabela receita)
                (SELECT COALESCE(SUM(Valor), 0) FROM receita 
                 WHERE Status = 'Pago') as ReceitaTotalEfetiva,
                
                -- ========== MÉTRICAS DE DESPESAS ==========
                -- Despesas do período
                (SELECT COALESCE(SUM(Valor), 0) FROM despesa 
                 WHERE DATE(DataDespesa) BETWEEN ? AND ? AND Status = 'Pago') as TotalDespesas,
                
                -- Comissões baseadas em atendimentos concluídos
                (SELECT COALESCE(SUM(com.ValorTotal), 0) FROM comissao com
                 INNER JOIN atendimento at ON com.IdAtendimento = at.IdAtendimento
                 WHERE at.Status = 'Concluído' AND com.Status = 'Pago') as TotalComissoes,
                
                -- Inadimplência (atendimentos sem pagamento)
                (SELECT COALESCE(SUM(at.Valor), 0) FROM atendimento at
                 LEFT JOIN pagamento p ON at.IdAtendimento = p.IdAtendimento
                 WHERE at.Status = 'Concluído' 
                 AND (p.IdPagamento IS NULL OR p.StatusPagamento != 'Pago')) as TotalInadimplencia,
                
                -- ========== QUANTIDADES ==========
                -- Quantidades de atendimentos por status
                (SELECT COUNT(*) FROM atendimento 
                 WHERE Status = 'Concluído') as QtdAtendimentosConcluidos,
                
                (SELECT COUNT(*) FROM atendimento 
                 WHERE Status != 'Concluído') as QtdAtendimentosPendentes,
                
                (SELECT COUNT(*) FROM atendimento) as QtdTotalAtendimentos,
                
                (SELECT COUNT(*) FROM receita 
                 WHERE Status = 'Pago') as QtdReceitasEfetivas,
                
                (SELECT COUNT(*) FROM despesa 
                 WHERE DATE(DataDespesa) BETWEEN ? AND ? AND Status = 'Pago') as QtdDespesas,
                
                (SELECT COUNT(*) FROM atendimento at
                 LEFT JOIN pagamento p ON at.IdAtendimento = p.IdAtendimento
                 WHERE at.Status = 'Concluído' 
                 AND (p.IdPagamento IS NULL OR p.StatusPagamento != 'Pago')) as QtdInadimplencia
        `;
        
        try {
            const [rows] = await db.execute(query, [
                dataInicio, dataFim, // TotalDespesas  
                dataInicio, dataFim, // QtdDespesas
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
                DATE_FORMAT(DataInicio, '%Y-%m') as Mes,
                SUM(Valor) as TotalReceitas,
                COUNT(*) as QtdReceitas
            FROM atendimento 
            WHERE DataInicio >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
            AND Status = 'Concluído'
            GROUP BY DATE_FORMAT(DataInicio, '%Y-%m')
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
                COALESCE(SUM(a.Valor), 0) as TotalReceitas,
                COALESCE(AVG(a.Valor), 0) as MediaAtendimento,
                COALESCE(SUM(com.ValorTotal), 0) as TotalComissoes
            FROM cuidador c
            LEFT JOIN atendimento a ON c.IdCuidador = a.IdCuidador 
                AND DATE(a.DataInicio) BETWEEN ? AND ?
                AND a.Status = 'Concluído'
            LEFT JOIN comissao com ON a.IdAtendimento = com.IdAtendimento
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

    // ========== AUTOMAÇÃO DE RECEITAS ==========
    
    // Criar receita automaticamente quando atendimento for concluído
    async criarReceitaAutomatica(IdAtendimento) {
        try {
            // 🔒 PROTEÇÃO: Buscar dados do atendimento com validação rigorosa
            const [atendimentoRows] = await db.execute(`
                SELECT IdAtendimento, IdResponsavel, Valor, DataInicio, Status
                FROM atendimento 
                WHERE IdAtendimento = ?
            `, [IdAtendimento]);
            
            if (atendimentoRows.length === 0) {
                return { success: false, message: 'Atendimento não encontrado' };
            }
            
            const atendimento = atendimentoRows[0];
            
            // 🔒 PROTEÇÃO: Verificar se o atendimento está realmente concluído
            if (atendimento.Status !== 'Concluído') {
                return { 
                    success: false, 
                    message: `Não é possível criar receita para atendimento com status '${atendimento.Status}'. Apenas atendimentos 'Concluído' podem gerar receitas automaticamente.` 
                };
            }
            
            // 🔒 PROTEÇÃO: Verificar se já existe receita para este atendimento
            const [receitaExistente] = await db.execute(`
                SELECT IdReceita FROM receita WHERE IdAtendimento = ?
            `, [IdAtendimento]);
            
            if (receitaExistente.length > 0) {
                return { success: false, message: 'Receita já existe para este atendimento' };
            }
            
            // 🔒 PROTEÇÃO: Verificar se o valor do atendimento é válido
            if (!atendimento.Valor || parseFloat(atendimento.Valor) <= 0) {
                return { success: false, message: 'Valor do atendimento inválido para gerar receita' };
            }
            
            // Criar receita automaticamente (apenas se passou em todas as validações)
            const [result] = await db.execute(`
                INSERT INTO receita (IdAtendimento, IdResponsavel, Valor, Status, FormaPagamento, Observacoes, DataRecebimento)
                VALUES (?, ?, ?, 'Pago', 'Automático', 'Receita gerada automaticamente pelo sistema', NOW())
            `, [IdAtendimento, atendimento.IdResponsavel, atendimento.Valor]);
            
            return { 
                success: true, 
                message: 'Receita criada automaticamente com sucesso', 
                id: result.insertId 
            };
        } catch (error) {
            console.error('Erro ao criar receita automática:', error);
            return { success: false, message: 'Erro ao criar receita automática' };
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
