// controller/chatController.js
import chatModel from '../models/chatModel.js';

class ChatController {
    // Criar novo ticket de suporte
    async criarTicketSuporte(req, res) {
        try {
            const { IdUsuario, TipoUsuario, Categoria, Prioridade, Assunto } = req.body;

            // Validações
            if (!IdUsuario || !TipoUsuario || !Categoria || !Assunto) {
                return res.status(400).json({
                    success: false,
                    message: 'Todos os campos obrigatórios devem ser preenchidos'
                });
            }

            if (!['cuidador', 'responsavel', 'admin', 'Administrador'].includes(TipoUsuario)) {
                return res.status(400).json({
                    success: false,
                    message: 'Tipo de usuário inválido'
                });
            }

            if (!['Geral', 'Atendimento', 'Pagamento', 'Técnico', 'Sugestão', 'Reclamação'].includes(Categoria)) {
                return res.status(400).json({
                    success: false,
                    message: 'Categoria inválida'
                });
            }

            const IdAdministrador = req.session.usuario?.id || 1;
            
            const resultado = await chatModel.criarTicketSuporte({
                IdUsuario,
                TipoUsuario,
                Categoria,
                Prioridade: Prioridade || 'Normal',
                Assunto,
                IdAdministrador
            });

            if (resultado.success) {
                res.status(201).json({
                    success: true,
                    message: 'Ticket de suporte criado com sucesso',
                    data: { id: resultado.id }
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: resultado.message
                });
            }
        } catch (error) {
            console.error('Erro no controller criarTicketSuporte:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    // Buscar tickets de um usuário
    async buscarTicketsUsuario(req, res) {
        try {
            const { id, tipo } = req.params;

            if (!id || !tipo) {
                return res.status(400).json({
                    success: false,
                    message: 'ID e tipo do usuário são obrigatórios'
                });
            }

            if (!['cuidador', 'responsavel', 'admin', 'Administrador'].includes(tipo)) {
                return res.status(400).json({
                    success: false,
                    message: 'Tipo de usuário inválido'
                });
            }

            const resultado = await chatModel.buscarTicketsUsuario(id, tipo);

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
            console.error('Erro no controller buscarTicketsUsuario:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    // Buscar todos os tickets (para administradores)
    async buscarTodosTickets(req, res) {
        try {
            const { status, categoria, prioridade } = req.query;
            
            const filtros = {};
            if (status) filtros.status = status;
            if (categoria) filtros.categoria = categoria;
            if (prioridade) filtros.prioridade = prioridade;

            const resultado = await chatModel.buscarTodosTickets(filtros);

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
            console.error('Erro no controller buscarTodosTickets:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    // Enviar mensagem de suporte
    async enviarMensagemSuporte(req, res) {
        try {
            const { IdChat, IdRemetente, RemetenteTipo, Conteudo } = req.body;

            // Verificar se o usuário está logado
            if (!req.session.usuario) {
                return res.status(401).json({
                    success: false,
                    message: 'Usuário não autenticado'
                });
            }

            // Detectar se é administrador baseado na sessão
            const isAdmin = req.session.usuario.tipo === 'admin' || req.session.usuario.tipo === 'administrador' || req.session.usuario.tipo === 'Administrador' || req.session.usuario.tipo === 'Adm';
            
            // Se for admin, usar dados da sessão
            const finalIdRemetente = isAdmin ? req.session.usuario.id : IdRemetente;
            const finalRemetenteTipo = isAdmin ? req.session.usuario.tipo : RemetenteTipo;

            // Validações
            if (!IdChat || !finalIdRemetente || !finalRemetenteTipo || !Conteudo) {
                return res.status(400).json({
                    success: false,
                    message: 'Todos os campos são obrigatórios'
                });
            }

            if (!['cuidador', 'responsavel', 'admin', 'Administrador'].includes(finalRemetenteTipo)) {
                return res.status(400).json({
                    success: false,
                    message: 'Tipo de remetente inválido'
                });
            }

            if (Conteudo.trim().length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Conteúdo da mensagem não pode estar vazio'
                });
            }

            const IdAdministrador = req.session.usuario?.id || 1;
            
            const resultado = await chatModel.enviarMensagemSuporte({
                IdChat,
                IdRemetente: finalIdRemetente,
                RemetenteTipo: finalRemetenteTipo,
                Conteudo: Conteudo.trim(),
                IsAdmin: isAdmin,
                IdAdministrador
            });

            if (resultado.success) {
                res.status(201).json({
                    success: true,
                    message: 'Mensagem enviada com sucesso',
                    data: { id: resultado.id }
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: resultado.message
                });
            }
        } catch (error) {
            console.error('Erro no controller enviarMensagemSuporte:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    // Buscar mensagens de um chat
    async buscarMensagensChat(req, res) {
        try {
            const { id } = req.params;
            const { limite = 50 } = req.query;

            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: 'ID do chat é obrigatório'
                });
            }

            const resultado = await chatModel.buscarMensagensSuporte(id, parseInt(limite));

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
            console.error('Erro no controller buscarMensagensChat:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    // Marcar mensagens como lidas
    async marcarMensagensComoLidas(req, res) {
        try {
            const { id } = req.params;
            const { IdUsuario, TipoUsuario } = req.body;

            if (!id || !IdUsuario || !TipoUsuario) {
                return res.status(400).json({
                    success: false,
                    message: 'ID do chat, ID do usuário e tipo são obrigatórios'
                });
            }

            const resultado = await chatModel.marcarMensagensComoLidas(id, IdUsuario, TipoUsuario);

            if (resultado.success) {
                res.json({
                    success: true,
                    message: 'Mensagens marcadas como lidas',
                    data: { affectedRows: resultado.affectedRows }
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: resultado.message
                });
            }
        } catch (error) {
            console.error('Erro no controller marcarMensagensComoLidas:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    // Buscar contatos disponíveis
    async buscarContatosDisponiveis(req, res) {
        try {
            const { id, tipo } = req.params;

            if (!id || !tipo) {
                return res.status(400).json({
                    success: false,
                    message: 'ID e tipo do usuário são obrigatórios'
                });
            }

            if (!['cuidador', 'responsavel', 'admin', 'Administrador'].includes(tipo)) {
                return res.status(400).json({
                    success: false,
                    message: 'Tipo de usuário inválido'
                });
            }

            const resultado = await chatModel.buscarContatosDisponiveis(id, tipo);

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
            console.error('Erro no controller buscarContatosDisponiveis:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    // Buscar estatísticas de chat
    async buscarEstatisticasChat(req, res) {
        try {
            const { id, tipo } = req.params;

            if (!id || !tipo) {
                return res.status(400).json({
                    success: false,
                    message: 'ID e tipo do usuário são obrigatórios'
                });
            }

            if (!['cuidador', 'responsavel', 'admin', 'Administrador'].includes(tipo)) {
                return res.status(400).json({
                    success: false,
                    message: 'Tipo de usuário inválido'
                });
            }

            const resultado = await chatModel.buscarEstatisticasChat(id, tipo);

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
            console.error('Erro no controller buscarEstatisticasChat:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    // Buscar chat por ID
    async buscarChatPorId(req, res) {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: 'ID do chat é obrigatório'
                });
            }

            const resultado = await chatModel.buscarTicketPorId(id);

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
            console.error('Erro no controller buscarChatPorId:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    // Arquivar chat
    async arquivarChat(req, res) {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: 'ID do chat é obrigatório'
                });
            }

            const IdAdministrador = req.session.usuario?.id || 1;
            
            const resultado = await chatModel.arquivarChat(id, IdAdministrador);

            if (resultado.success) {
                res.json({
                    success: true,
                    message: 'Chat arquivado com sucesso'
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: resultado.message
                });
            }
        } catch (error) {
            console.error('Erro no controller arquivarChat:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    // Buscar categorias de suporte
    async buscarCategoriasSuporte(req, res) {
        try {
            const resultado = await chatModel.buscarCategoriasSuporte();

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
            console.error('Erro no controller buscarCategoriasSuporte:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    // Atualizar status do ticket
    async atualizarStatusTicket(req, res) {
        try {
            const { id } = req.params;
            const { StatusSuporte } = req.body;

            if (!id || !StatusSuporte) {
                return res.status(400).json({
                    success: false,
                    message: 'ID do ticket e status são obrigatórios'
                });
            }

            if (!['Aberto', 'Em Andamento', 'Fechado'].includes(StatusSuporte)) {
                return res.status(400).json({
                    success: false,
                    message: 'Status inválido'
                });
            }

            const IdAdministrador = req.session.usuario?.id || 1;
            
            const resultado = await chatModel.atualizarStatusTicket(id, StatusSuporte, IdAdministrador);

            if (resultado.success) {
                res.json({
                    success: true,
                    message: 'Status do ticket atualizado com sucesso'
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: resultado.message
                });
            }
        } catch (error) {
            console.error('Erro no controller atualizarStatusTicket:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    // Buscar estatísticas de suporte
    async buscarEstatisticasSuporte(req, res) {
        try {
            const resultado = await chatModel.buscarEstatisticasSuporte();

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
            console.error('Erro no controller buscarEstatisticasSuporte:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }
}

export default new ChatController();
