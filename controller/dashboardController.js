// controller/dashboardController.js
import dashboardModel from '../model/dashboardModel.js';

class DashboardController {
    // Buscar todas as métricas do dashboard
    async buscarMetricasCompletas(req, res) {
        try {
            // Buscar métricas em lotes para evitar sobrecarga de conexões
            console.log('Iniciando carregamento de métricas do dashboard...');
            
            // Lote 1: Estatísticas básicas
            const [estatisticasGerais, estatisticasFinanceiras] = await Promise.all([
                dashboardModel.buscarEstatisticasGerais(),
                dashboardModel.buscarEstatisticasFinanceiras()
            ]);
            
            // Lote 2: Dados de atendimentos
            const [atendimentosPorMes, atendimentosPorStatus, atendimentosPorDia] = await Promise.all([
                dashboardModel.buscarAtendimentosPorMes(),
                dashboardModel.buscarAtendimentosPorStatus(),
                dashboardModel.buscarAtendimentosPorDia()
            ]);
            
            // Lote 3: Dados de cuidadores e distribuições
            const [cuidadoresMaisAtivos, distribuicaoAutonomia, distribuicaoMobilidade] = await Promise.all([
                dashboardModel.buscarCuidadoresMaisAtivos(),
                dashboardModel.buscarDistribuicaoAutonomia(),
                dashboardModel.buscarDistribuicaoMobilidade()
            ]);
            
            // Lote 4: Dados de avaliações e especialidades
            const [distribuicaoAvaliacoes, especialidadesMaisProcuradas, dadosCrescimento] = await Promise.all([
                dashboardModel.buscarDistribuicaoAvaliacoes(),
                dashboardModel.buscarEspecialidadesMaisProcuradas(),
                dashboardModel.buscarDadosCrescimento()
            ]);

            // Verificar se todas as consultas foram bem-sucedidas
            const resultados = [
                estatisticasGerais, estatisticasFinanceiras, atendimentosPorMes,
                cuidadoresMaisAtivos, distribuicaoAutonomia, distribuicaoMobilidade,
                distribuicaoAvaliacoes, atendimentosPorStatus, atendimentosPorDia,
                especialidadesMaisProcuradas, dadosCrescimento
            ];

            const falhas = resultados.filter(resultado => !resultado.success);
            if (falhas.length > 0) {
                console.error('Algumas consultas falharam:', falhas);
                
                // Se muitas consultas falharam, retornar erro
                if (falhas.length > resultados.length / 2) {
                    return res.status(500).json({
                        success: false,
                        message: 'Erro ao carregar métricas do dashboard. Tente novamente em alguns instantes.'
                    });
                }
                
                // Se poucas consultas falharam, continuar com dados parciais
                console.log('Continuando com dados parciais...');
            }

            // Retornar todas as métricas organizadas
            res.json({
                success: true,
                data: {
                    estatisticasGerais: estatisticasGerais.data,
                    estatisticasFinanceiras: estatisticasFinanceiras.data,
                    atendimentosPorMes: atendimentosPorMes.data,
                    cuidadoresMaisAtivos: cuidadoresMaisAtivos.data,
                    distribuicaoAutonomia: distribuicaoAutonomia.data,
                    distribuicaoMobilidade: distribuicaoMobilidade.data,
                    distribuicaoAvaliacoes: distribuicaoAvaliacoes.data,
                    atendimentosPorStatus: atendimentosPorStatus.data,
                    atendimentosPorDia: atendimentosPorDia.data,
                    especialidadesMaisProcuradas: especialidadesMaisProcuradas.data,
                    dadosCrescimento: dadosCrescimento.data
                }
            });

        } catch (error) {
            console.error('Erro no controller buscarMetricasCompletas:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    // Buscar apenas estatísticas gerais
    async buscarEstatisticasGerais(req, res) {
        try {
            const resultado = await dashboardModel.buscarEstatisticasGerais();

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
            console.error('Erro no controller buscarEstatisticasGerais:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    // Buscar apenas estatísticas financeiras
    async buscarEstatisticasFinanceiras(req, res) {
        try {
            const resultado = await dashboardModel.buscarEstatisticasFinanceiras();

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
            console.error('Erro no controller buscarEstatisticasFinanceiras:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    // Buscar dados para gráficos
    async buscarDadosGraficos(req, res) {
        try {
            const { tipo } = req.params;

            let resultado;
            switch (tipo) {
                case 'atendimentos-mes':
                    resultado = await dashboardModel.buscarAtendimentosPorMes();
                    break;
                case 'atendimentos-dia':
                    resultado = await dashboardModel.buscarAtendimentosPorDia();
                    break;
                case 'avaliacoes':
                    resultado = await dashboardModel.buscarDistribuicaoAvaliacoes();
                    break;
                case 'autonomia':
                    resultado = await dashboardModel.buscarDistribuicaoAutonomia();
                    break;
                case 'mobilidade':
                    resultado = await dashboardModel.buscarDistribuicaoMobilidade();
                    break;
                case 'status':
                    resultado = await dashboardModel.buscarAtendimentosPorStatus();
                    break;
                case 'especialidades':
                    resultado = await dashboardModel.buscarEspecialidadesMaisProcuradas();
                    break;
                default:
                    return res.status(400).json({
                        success: false,
                        message: 'Tipo de gráfico não encontrado'
                    });
            }

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
            console.error('Erro no controller buscarDadosGraficos:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    // Buscar cuidadores mais ativos
    async buscarCuidadoresMaisAtivos(req, res) {
        try {
            const resultado = await dashboardModel.buscarCuidadoresMaisAtivos();

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
            console.error('Erro no controller buscarCuidadoresMaisAtivos:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    // Buscar dados de crescimento
    async buscarDadosCrescimento(req, res) {
        try {
            const resultado = await dashboardModel.buscarDadosCrescimento();

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
            console.error('Erro no controller buscarDadosCrescimento:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }
}

export default new DashboardController();
