// controller/avaliacaoController.js
import avaliacaoModel from '../model/avaliacaoModel.js';

class AvaliacaoController {
    // Criar nova avaliação
    async criarAvaliacao(req, res) {
        try {
            const { IdResponsavel, IdCuidador, IdAtendimento, Nota, Comentario } = req.body;

            // Validações
            if (!IdResponsavel || !IdCuidador || !IdAtendimento || !Nota) {
                return res.status(400).json({
                    success: false,
                    message: 'Dados obrigatórios não fornecidos'
                });
            }

            if (Nota < 1 || Nota > 5) {
                return res.status(400).json({
                    success: false,
                    message: 'Nota deve estar entre 1 e 5'
                });
            }

            // Verificar se já existe avaliação para este atendimento
            const avaliacaoExistente = await avaliacaoModel.verificarAvaliacaoExistente(IdAtendimento);
            if (avaliacaoExistente.success && avaliacaoExistente.data) {
                return res.status(400).json({
                    success: false,
                    message: 'Este atendimento já foi avaliado'
                });
            }

            const resultado = await avaliacaoModel.criarAvaliacao({
                IdResponsavel,
                IdCuidador,
                IdAtendimento,
                Nota,
                Comentario
            });

            if (resultado.success) {
                res.status(201).json({
                    success: true,
                    message: 'Avaliação criada com sucesso',
                    data: { id: resultado.id }
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: resultado.message
                });
            }
        } catch (error) {
            console.error('Erro no controller criarAvaliacao:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    // Buscar todas as avaliações
    async buscarTodasAvaliacoes(req, res) {
        try {
            const resultado = await avaliacaoModel.buscarTodasAvaliacoes();

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
            console.error('Erro no controller buscarTodasAvaliacoes:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    // Buscar avaliações por cuidador
    async buscarAvaliacoesPorCuidador(req, res) {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: 'ID do cuidador não fornecido'
                });
            }

            const resultado = await avaliacaoModel.buscarAvaliacoesPorCuidador(id);

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
            console.error('Erro no controller buscarAvaliacoesPorCuidador:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    // Buscar avaliações por responsável
    async buscarAvaliacoesPorResponsavel(req, res) {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: 'ID do responsável não fornecido'
                });
            }

            const resultado = await avaliacaoModel.buscarAvaliacoesPorResponsavel(id);

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
            console.error('Erro no controller buscarAvaliacoesPorResponsavel:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    // Calcular média de avaliações por cuidador
    async calcularMediaCuidador(req, res) {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: 'ID do cuidador não fornecido'
                });
            }

            const resultado = await avaliacaoModel.calcularMediaCuidador(id);

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
            console.error('Erro no controller calcularMediaCuidador:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    // Buscar estatísticas gerais
    async buscarEstatisticas(req, res) {
        try {
            const resultado = await avaliacaoModel.buscarEstatisticas();

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
            console.error('Erro no controller buscarEstatisticas:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    // Buscar atendimentos disponíveis para avaliação
    async buscarAtendimentosParaAvaliacao(req, res) {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: 'ID do responsável não fornecido'
                });
            }

            const resultado = await avaliacaoModel.buscarAtendimentosParaAvaliacao(id);

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
            console.error('Erro no controller buscarAtendimentosParaAvaliacao:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    // Atualizar avaliação
    async atualizarAvaliacao(req, res) {
        try {
            const { id } = req.params;
            const { Nota, Comentario } = req.body;

            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: 'ID da avaliação não fornecido'
                });
            }

            if (Nota && (Nota < 1 || Nota > 5)) {
                return res.status(400).json({
                    success: false,
                    message: 'Nota deve estar entre 1 e 5'
                });
            }

            const resultado = await avaliacaoModel.atualizarAvaliacao(id, { Nota, Comentario });

            if (resultado.success) {
                if (resultado.affectedRows > 0) {
                    res.json({
                        success: true,
                        message: 'Avaliação atualizada com sucesso'
                    });
                } else {
                    res.status(404).json({
                        success: false,
                        message: 'Avaliação não encontrada'
                    });
                }
            } else {
                res.status(500).json({
                    success: false,
                    message: resultado.message
                });
            }
        } catch (error) {
            console.error('Erro no controller atualizarAvaliacao:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    // Excluir avaliação
    async excluirAvaliacao(req, res) {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: 'ID da avaliação não fornecido'
                });
            }

            const resultado = await avaliacaoModel.excluirAvaliacao(id);

            if (resultado.success) {
                if (resultado.affectedRows > 0) {
                    res.json({
                        success: true,
                        message: 'Avaliação excluída com sucesso'
                    });
                } else {
                    res.status(404).json({
                        success: false,
                        message: 'Avaliação não encontrada'
                    });
                }
            } else {
                res.status(500).json({
                    success: false,
                    message: resultado.message
                });
            }
        } catch (error) {
            console.error('Erro no controller excluirAvaliacao:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }
}

export default new AvaliacaoController();
