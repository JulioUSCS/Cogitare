// controller/financeiroController.js
import financeiroModel from '../model/financeiroModel.js';

class FinanceiroController {
    // ========== RECEITAS ==========
    
    // Criar nova receita
    async criarReceita(req, res) {
        try {
            const { IdAtendimento, IdResponsavel, Valor, FormaPagamento, Observacoes } = req.body;

            // Validações
            if (!IdResponsavel || !Valor) {
                return res.status(400).json({
                    success: false,
                    message: 'ID do responsável e valor são obrigatórios'
                });
            }

            if (Valor <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Valor deve ser maior que zero'
                });
            }

            const resultado = await financeiroModel.criarReceita({
                IdAtendimento,
                IdResponsavel,
                Valor,
                FormaPagamento: FormaPagamento || 'Dinheiro',
                Observacoes
            });

            if (resultado.success) {
                res.status(201).json({
                    success: true,
                    message: 'Receita criada com sucesso',
                    data: { id: resultado.id }
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: resultado.message
                });
            }
        } catch (error) {
            console.error('Erro no controller criarReceita:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    // Buscar receitas por período
    async buscarReceitasPorPeriodo(req, res) {
        try {
            const { dataInicio, dataFim } = req.query;

            if (!dataInicio || !dataFim) {
                return res.status(400).json({
                    success: false,
                    message: 'Data de início e fim são obrigatórias'
                });
            }

            const resultado = await financeiroModel.buscarReceitasPorPeriodo(dataInicio, dataFim);

            if (resultado.success) {
                res.json({
                    success: true,
                    data: resultado.data
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: resultado.message
                });
            }
        } catch (error) {
            console.error('Erro no controller buscarReceitasPorPeriodo:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    // ========== DESPESAS ==========
    
    // Criar nova despesa
    async criarDespesa(req, res) {
        try {
            const { TipoDespesa, Categoria, Descricao, Valor, IdCuidador, Comprovante, Observacoes } = req.body;

            // Validações
            if (!TipoDespesa || !Categoria || !Valor) {
                return res.status(400).json({
                    success: false,
                    message: 'Tipo, categoria e valor são obrigatórios'
                });
            }

            if (Valor <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Valor deve ser maior que zero'
                });
            }

            const resultado = await financeiroModel.criarDespesa({
                TipoDespesa,
                Categoria,
                Descricao,
                Valor,
                IdCuidador,
                Comprovante,
                Observacoes
            });

            if (resultado.success) {
                res.status(201).json({
                    success: true,
                    message: 'Despesa criada com sucesso',
                    data: { id: resultado.id }
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: resultado.message
                });
            }
        } catch (error) {
            console.error('Erro no controller criarDespesa:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    // Buscar despesas por período
    async buscarDespesasPorPeriodo(req, res) {
        try {
            const { dataInicio, dataFim } = req.query;

            if (!dataInicio || !dataFim) {
                return res.status(400).json({
                    success: false,
                    message: 'Data de início e fim são obrigatórias'
                });
            }

            const resultado = await financeiroModel.buscarDespesasPorPeriodo(dataInicio, dataFim);

            if (resultado.success) {
                res.json({
                    success: true,
                    data: resultado.data
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: resultado.message
                });
            }
        } catch (error) {
            console.error('Erro no controller buscarDespesasPorPeriodo:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    // ========== COMISSÕES ==========
    
    // Calcular comissão
    async calcularComissao(req, res) {
        try {
            const { IdAtendimento, IdCuidador } = req.body;

            if (!IdAtendimento || !IdCuidador) {
                return res.status(400).json({
                    success: false,
                    message: 'ID do atendimento e cuidador são obrigatórios'
                });
            }

            const resultado = await financeiroModel.calcularComissao(IdAtendimento, IdCuidador);

            if (resultado.success) {
                res.json({
                    success: true,
                    message: 'Comissão calculada com sucesso',
                    data: { id: resultado.id, valorComissao: resultado.valorComissao }
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: resultado.message
                });
            }
        } catch (error) {
            console.error('Erro no controller calcularComissao:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    // Buscar comissões por período
    async buscarComissoesPorPeriodo(req, res) {
        try {
            const { dataInicio, dataFim } = req.query;

            if (!dataInicio || !dataFim) {
                return res.status(400).json({
                    success: false,
                    message: 'Data de início e fim são obrigatórias'
                });
            }

            const resultado = await financeiroModel.buscarComissoesPorPeriodo(dataInicio, dataFim);

            if (resultado.success) {
                res.json({
                    success: true,
                    data: resultado.data
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: resultado.message
                });
            }
        } catch (error) {
            console.error('Erro no controller buscarComissoesPorPeriodo:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    // ========== INADIMPLÊNCIA ==========
    
    // Verificar inadimplência
    async verificarInadimplencia(req, res) {
        try {
            const resultado = await financeiroModel.verificarInadimplencia();

            if (resultado.success) {
                res.json({
                    success: true,
                    data: resultado.data
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: resultado.message
                });
            }
        } catch (error) {
            console.error('Erro no controller verificarInadimplencia:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    // Buscar inadimplência por período
    async buscarInadimplenciaPorPeriodo(req, res) {
        try {
            const { dataInicio, dataFim } = req.query;

            if (!dataInicio || !dataFim) {
                return res.status(400).json({
                    success: false,
                    message: 'Data de início e fim são obrigatórias'
                });
            }

            const resultado = await financeiroModel.buscarInadimplenciaPorPeriodo(dataInicio, dataFim);

            if (resultado.success) {
                res.json({
                    success: true,
                    data: resultado.data
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: resultado.message
                });
            }
        } catch (error) {
            console.error('Erro no controller buscarInadimplenciaPorPeriodo:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    // ========== DASHBOARD FINANCEIRO ==========
    
    // Buscar estatísticas financeiras
    async buscarEstatisticasFinanceiras(req, res) {
        try {
            const { dataInicio, dataFim } = req.query;

            // Se não fornecido, usar mês atual
            const inicio = dataInicio || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
            const fim = dataFim || new Date().toISOString().split('T')[0];

            const resultado = await financeiroModel.buscarEstatisticasFinanceiras(inicio, fim);

            if (resultado.success) {
                // Calcular lucro líquido
                const totalReceitas = parseFloat(resultado.data.TotalReceitas) || 0;
                const totalDespesas = parseFloat(resultado.data.TotalDespesas) || 0;
                const lucroLiquido = totalReceitas - totalDespesas;
                const margemLucro = totalReceitas > 0 ? ((lucroLiquido / totalReceitas) * 100) : 0;

                res.json({
                    success: true,
                    data: {
                        ...resultado.data,
                        LucroLiquido: lucroLiquido,
                        MargemLucro: margemLucro
                    }
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: resultado.message
                });
            }
        } catch (error) {
            console.error('Erro no controller buscarEstatisticasFinanceiras:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    // Buscar receitas por mês
    async buscarReceitasPorMes(req, res) {
        try {
            const resultado = await financeiroModel.buscarReceitasPorMes();

            if (resultado.success) {
                res.json({
                    success: true,
                    data: resultado.data
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: resultado.message
                });
            }
        } catch (error) {
            console.error('Erro no controller buscarReceitasPorMes:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    // Buscar despesas por categoria
    async buscarDespesasPorCategoria(req, res) {
        try {
            const { dataInicio, dataFim } = req.query;

            // Se não fornecido, usar mês atual
            const inicio = dataInicio || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
            const fim = dataFim || new Date().toISOString().split('T')[0];

            const resultado = await financeiroModel.buscarDespesasPorCategoria(inicio, fim);

            if (resultado.success) {
                res.json({
                    success: true,
                    data: resultado.data
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: resultado.message
                });
            }
        } catch (error) {
            console.error('Erro no controller buscarDespesasPorCategoria:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    // Buscar cuidadores mais rentáveis
    async buscarCuidadoresMaisRentaveis(req, res) {
        try {
            const { dataInicio, dataFim } = req.query;

            // Se não fornecido, usar mês atual
            const inicio = dataInicio || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
            const fim = dataFim || new Date().toISOString().split('T')[0];

            const resultado = await financeiroModel.buscarCuidadoresMaisRentaveis(inicio, fim);

            if (resultado.success) {
                res.json({
                    success: true,
                    data: resultado.data
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: resultado.message
                });
            }
        } catch (error) {
            console.error('Erro no controller buscarCuidadoresMaisRentaveis:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    // ========== METAS FINANCEIRAS ==========
    
    // Buscar metas financeiras
    async buscarMetasFinanceiras(req, res) {
        try {
            const resultado = await financeiroModel.buscarMetasFinanceiras();

            if (resultado.success) {
                res.json({
                    success: true,
                    data: resultado.data
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: resultado.message
                });
            }
        } catch (error) {
            console.error('Erro no controller buscarMetasFinanceiras:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    // Atualizar progresso das metas
    async atualizarProgressoMetas(req, res) {
        try {
            const resultado = await financeiroModel.atualizarProgressoMetas();

            if (resultado.success) {
                res.json({
                    success: true,
                    message: 'Progresso das metas atualizado com sucesso'
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: resultado.message
                });
            }
        } catch (error) {
            console.error('Erro no controller atualizarProgressoMetas:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }
}

export default new FinanceiroController();
