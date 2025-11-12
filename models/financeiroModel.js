// model/financeiroModel.js
import db from '../config/db.js';

class FinanceiroModel {
    // ========== RECEITAS ==========
    
    // Criar nova receita usando stored procedure
    async criarReceita(receita) {
        const { IdAtendimento, IdResponsavel, Valor, FormaPagamento, Observacoes } = receita;
        
        try {
            const query = `CALL sp_criar_receita(?, ?, ?, ?, ?, @p_IdReceita, @p_Mensagem, @p_Sucesso)`;
            await db.execute(query, [IdAtendimento, IdResponsavel, Valor, FormaPagamento, Observacoes]);
            
            // Buscar valores de saída
            const [resultados] = await db.execute('SELECT @p_IdReceita as id, @p_Mensagem as mensagem, @p_Sucesso as sucesso');
            const resultado = resultados[0];
            
            return { 
                success: resultado.sucesso === 1, 
                id: resultado.id,
                message: resultado.mensagem 
            };
        } catch (error) {
            console.error('Erro ao criar receita:', error);
            return { success: false, message: 'Erro ao criar receita' };
        }
    }

    // Buscar receitas por período usando stored procedure
    async buscarReceitasPorPeriodo(dataInicio, dataFim) {
        try {
            const [rows] = await db.execute('CALL sp_buscar_receitas_periodo(?, ?)', [dataInicio, dataFim]);
            return { success: true, data: rows[0] };
        } catch (error) {
            console.error('Erro ao buscar receitas por período:', error);
            return { success: false, message: 'Erro ao buscar receitas por período' };
        }
    }

    // ========== DESPESAS ==========
    
    // Criar nova despesa usando stored procedure
    async criarDespesa(despesa) {
        const { TipoDespesa, Categoria, Descricao, Valor, IdCuidador, Comprovante, Observacoes } = despesa;
        
        try {
            const query = `CALL sp_criar_despesa(?, ?, ?, ?, ?, ?, ?, @p_IdDespesa, @p_Mensagem, @p_Sucesso)`;
            await db.execute(query, [TipoDespesa, Categoria, Descricao, Valor, IdCuidador, Comprovante, Observacoes]);
            
            // Buscar valores de saída
            const [resultados] = await db.execute('SELECT @p_IdDespesa as id, @p_Mensagem as mensagem, @p_Sucesso as sucesso');
            const resultado = resultados[0];
            
            return { 
                success: resultado.sucesso === 1, 
                id: resultado.id,
                message: resultado.mensagem 
            };
        } catch (error) {
            console.error('Erro ao criar despesa:', error);
            return { success: false, message: 'Erro ao criar despesa' };
        }
    }

    // Buscar despesas por período usando stored procedure
    async buscarDespesasPorPeriodo(dataInicio, dataFim) {
        try {
            const [rows] = await db.execute('CALL sp_buscar_despesas_periodo(?, ?)', [dataInicio, dataFim]);
            return { success: true, data: rows[0] };
        } catch (error) {
            console.error('Erro ao buscar despesas por período:', error);
            return { success: false, message: 'Erro ao buscar despesas por período' };
        }
    }

    // ========== COMISSÕES ==========
    
    // Calcular comissão usando stored procedure
    async calcularComissao(IdAtendimento, IdCuidador) {
        try {
            const query = `CALL sp_calcular_comissao(?, ?, @p_IdComissao, @p_ValorComissao, @p_Mensagem, @p_Sucesso)`;
            await db.execute(query, [IdAtendimento, IdCuidador]);
            
            // Buscar valores de saída
            const [resultados] = await db.execute('SELECT @p_IdComissao as id, @p_ValorComissao as valorComissao, @p_Mensagem as mensagem, @p_Sucesso as sucesso');
            const resultado = resultados[0];
            
            return { 
                success: resultado.sucesso === 1, 
                id: resultado.id,
                valorComissao: resultado.valorComissao,
                message: resultado.mensagem 
            };
        } catch (error) {
            console.error('Erro ao calcular comissão:', error);
            return { success: false, message: 'Erro ao calcular comissão' };
        }
    }

    // Buscar comissões por período usando stored procedure
    async buscarComissoesPorPeriodo(dataInicio, dataFim) {
        try {
            const [rows] = await db.execute('CALL sp_buscar_comissoes_periodo(?, ?)', [dataInicio, dataFim]);
            return { success: true, data: rows[0] };
        } catch (error) {
            console.error('Erro ao buscar comissões por período:', error);
            return { success: false, message: 'Erro ao buscar comissões por período' };
        }
    }

    // ========== INADIMPLÊNCIA ==========
    
    // Verificar inadimplência usando stored procedure
    async verificarInadimplencia() {
        try {
            const [rows] = await db.execute('CALL sp_verificar_inadimplencia()');
            return { success: true, data: rows[0] };
        } catch (error) {
            console.error('Erro ao verificar inadimplência:', error);
            return { success: false, message: 'Erro ao verificar inadimplência' };
        }
    }

    // Buscar inadimplência por período usando stored procedure
    async buscarInadimplenciaPorPeriodo(dataInicio, dataFim) {
        try {
            const [rows] = await db.execute('CALL sp_buscar_inadimplencia_periodo(?, ?)', [dataInicio, dataFim]);
            return { success: true, data: rows[0] };
        } catch (error) {
            console.error('Erro ao buscar inadimplência por período:', error);
            return { success: false, message: 'Erro ao buscar inadimplência por período' };
        }
    }

    // ========== DASHBOARD FINANCEIRO ==========
    
    // Buscar estatísticas financeiras usando stored procedure
    async buscarEstatisticasFinanceiras(dataInicio, dataFim) {
        try {
            const [rows] = await db.execute('CALL sp_buscar_estatisticas_financeiras(?, ?)', [dataInicio, dataFim]);
            return { success: true, data: rows[0][0] };
        } catch (error) {
            console.error('Erro ao buscar estatísticas financeiras:', error);
            return { success: false, message: 'Erro ao buscar estatísticas financeiras' };
        }
    }

    // Buscar receitas por mês usando stored procedure
    async buscarReceitasPorMes() {
        try {
            const [rows] = await db.execute('CALL sp_buscar_receitas_mes()');
            return { success: true, data: rows[0] };
        } catch (error) {
            console.error('Erro ao buscar receitas por mês:', error);
            return { success: false, message: 'Erro ao buscar receitas por mês' };
        }
    }

    // Buscar despesas por categoria usando stored procedure
    async buscarDespesasPorCategoria(dataInicio, dataFim) {
        try {
            const [rows] = await db.execute('CALL sp_buscar_despesas_categoria(?, ?)', [dataInicio, dataFim]);
            return { success: true, data: rows[0] };
        } catch (error) {
            console.error('Erro ao buscar despesas por categoria:', error);
            return { success: false, message: 'Erro ao buscar despesas por categoria' };
        }
    }

    // Buscar cuidadores mais rentáveis via stored procedure
    async buscarCuidadoresMaisRentaveis(dataInicio, dataFim) {
        try {
            const [rows] = await db.execute(
                'CALL sp_buscar_cuidadores_rentaveis(?, ?)',
                [dataInicio, dataFim]
            );

            const lista = Array.isArray(rows) && rows[0] ? rows[0] : [];

            const dados = lista.map((row) => {
                const qtdAtendimentos = Number(row.QtdAtendimentos) || 0;
                const totalReceitas = Number(row.TotalReceitas) || 0;
                const totalComissoes = Number(row.TotalComissoes) || 0;
                const mediaAtendimento = Number(row.MediaAtendimento) || (
                    qtdAtendimentos > 0 ? totalReceitas / qtdAtendimentos : 0
                );

                return {
                    IdCuidador: row.IdCuidador,
                    Nome: row.Nome,
                    QtdAtendimentos: qtdAtendimentos,
                    TotalReceitas: totalReceitas,
                    MediaAtendimento: mediaAtendimento,
                    TotalComissoes: totalComissoes
                };
            });

            return { success: true, data: dados };
        } catch (error) {
            console.error('Erro ao buscar cuidadores mais rentáveis:', error);
            return { success: false, message: 'Erro ao buscar cuidadores mais rentáveis' };
        }
    }

    // ========== AUTOMAÇÃO DE RECEITAS ==========
    
    // Criar receita automaticamente usando stored procedure
    async criarReceitaAutomatica(IdAtendimento) {
        try {
            const query = `CALL sp_criar_receita_automatica(?, @p_IdReceita, @p_Mensagem, @p_Sucesso)`;
            await db.execute(query, [IdAtendimento]);
            
            // Buscar valores de saída
            const [resultados] = await db.execute('SELECT @p_IdReceita as id, @p_Mensagem as mensagem, @p_Sucesso as sucesso');
            const resultado = resultados[0];
            
            return { 
                success: resultado.sucesso === 1, 
                id: resultado.id,
                message: resultado.mensagem 
            };
        } catch (error) {
            console.error('Erro ao criar receita automática:', error);
            return { success: false, message: 'Erro ao criar receita automática' };
        }
    }

    // ========== METAS FINANCEIRAS ==========
    
    // Buscar metas financeiras usando stored procedure
    async buscarMetasFinanceiras() {
        try {
            const [rows] = await db.execute('CALL sp_buscar_metas_financeiras()');
            return { success: true, data: rows[0] };
        } catch (error) {
            console.error('Erro ao buscar metas financeiras:', error);
            return { success: false, message: 'Erro ao buscar metas financeiras' };
        }
    }

    // Atualizar progresso das metas usando stored procedure
    async atualizarProgressoMetas() {
        try {
            const query = `CALL sp_atualizar_progresso_metas(@p_Mensagem, @p_Sucesso)`;
            await db.execute(query);
            
            // Buscar valores de saída
            const [resultados] = await db.execute('SELECT @p_Mensagem as mensagem, @p_Sucesso as sucesso');
            const resultado = resultados[0];
            
            return { 
                success: resultado.sucesso === 1,
                message: resultado.mensagem 
            };
        } catch (error) {
            console.error('Erro ao atualizar progresso das metas:', error);
            return { success: false, message: 'Erro ao atualizar progresso das metas' };
        }
    }
}

export default new FinanceiroModel();
