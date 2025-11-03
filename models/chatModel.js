// model/chatModel.js
import pool from '../config/db.js';

class ChatModel {
    // Criar novo ticket de suporte
    async criarTicketSuporte(ticket) {
        const { IdUsuario, TipoUsuario, Categoria, Prioridade, Assunto, Status = 'Aberto', IdAdministrador } = ticket;
        const adminId = IdAdministrador || 1;
        
        try {
            const [result] = await pool.execute(
                'CALL sp_chat_criar_ticket(?, ?, ?, ?, ?, ?, ?)',
                [IdUsuario, TipoUsuario, Categoria, Prioridade, Assunto, Status, adminId]
            );
            const id = result[0] && result[0][0] ? result[0][0].Id : null;
            return { success: true, id };
        } catch (error) {
            console.error('Erro ao criar ticket de suporte:', error);
            return { success: false, message: 'Erro ao criar ticket de suporte' };
        }
    }

    // Buscar tickets de suporte de um usuário
    async buscarTicketsUsuario(IdUsuario, TipoUsuario) {
        try {
            const [result] = await pool.execute('CALL sp_chat_buscar_tickets_usuario(?, ?)', [IdUsuario, TipoUsuario]);
            return { success: true, data: result[0] };
        } catch (error) {
            console.error('Erro ao buscar tickets do usuário:', error);
            return { success: false, message: 'Erro ao buscar tickets do usuário' };
        }
    }

    // Buscar todos os tickets de suporte (para administradores)
    async buscarTodosTickets(filtros = {}) {
        try {
            const [result] = await pool.execute(
                'CALL sp_chat_buscar_todos_tickets(?, ?, ?)',
                [filtros.status || null, filtros.categoria || null, filtros.prioridade || null]
            );
            return { success: true, data: result[0] };
        } catch (error) {
            console.error('Erro ao buscar todos os tickets:', error);
            return { success: false, message: 'Erro ao buscar todos os tickets' };
        }
    }

    // Enviar mensagem de suporte
    async enviarMensagemSuporte(mensagem) {
        const { IdChat, IdRemetente, RemetenteTipo, Conteudo, IsAdmin = false, TipoMensagem = 'Texto', IdAdministrador } = mensagem;
        const adminId = IdAdministrador || 1;
        
        try {
            const [result] = await pool.execute(
                'CALL sp_chat_enviar_mensagem(?, ?, ?, ?, ?, ?, ?)',
                [IdChat, IdRemetente, RemetenteTipo, Conteudo, IsAdmin, TipoMensagem, adminId]
            );
            const id = result[0] && result[0][0] ? result[0][0].Id : null;
            return { success: true, id };
        } catch (error) {
            console.error('Erro ao enviar mensagem de suporte:', error);
            return { success: false, message: 'Erro ao enviar mensagem de suporte' };
        }
    }

    // Buscar mensagens de suporte
    async buscarMensagensSuporte(IdChat, limite = 50) {
        try {
            const [result] = await pool.execute('CALL sp_chat_buscar_mensagens(?, ?)', [IdChat, limite]);
            return { success: true, data: result[0] };
        } catch (error) {
            console.error('Erro ao buscar mensagens de suporte:', error);
            return { success: false, message: 'Erro ao buscar mensagens de suporte' };
        }
    }

    // Marcar mensagens como lidas
    async marcarMensagensComoLidas(IdChat, IdUsuario, TipoUsuario) {
        try {
            await pool.execute('CALL sp_chat_marcar_mensagens_lidas(?, ?, ?)', [IdChat, IdUsuario, TipoUsuario]);
            return { success: true };
        } catch (error) {
            console.error('Erro ao marcar mensagens como lidas:', error);
            return { success: false, message: 'Erro ao marcar mensagens como lidas' };
        }
    }

    // Buscar contatos disponíveis para chat
    async buscarContatosDisponiveis(IdUsuario, TipoUsuario) {
        try {
            let result;
            if (TipoUsuario === 'cuidador') {
                const [rows] = await pool.execute('CALL sp_chat_buscar_contatos_cuidador(?)', [IdUsuario]);
                result = rows;
            } else {
                const [rows] = await pool.execute('CALL sp_chat_buscar_contatos_responsavel(?)', [IdUsuario]);
                result = rows;
            }
            return { success: true, data: result[0] };
        } catch (error) {
            console.error('Erro ao buscar contatos disponíveis:', error);
            return { success: false, message: 'Erro ao buscar contatos disponíveis' };
        }
    }

    // Buscar estatísticas de chat
    async buscarEstatisticasChat(IdUsuario, TipoUsuario) {
        try {
            let result;
            if (TipoUsuario === 'cuidador') {
                const [rows] = await pool.execute('CALL sp_chat_estatisticas_cuidador(?)', [IdUsuario]);
                result = rows;
            } else {
                const [rows] = await pool.execute('CALL sp_chat_estatisticas_responsavel(?)', [IdUsuario]);
                result = rows;
            }
            return { success: true, data: result[0] && result[0][0] ? result[0][0] : null };
        } catch (error) {
            console.error('Erro ao buscar estatísticas de chat:', error);
            return { success: false, message: 'Erro ao buscar estatísticas de chat' };
        }
    }

    // Buscar chat por ID
    async buscarChatPorId(IdChat) {
        try {
            const [result] = await pool.execute('CALL sp_chat_buscar_chat_por_id(?)', [IdChat]);
            return { success: true, data: result[0] && result[0][0] ? result[0][0] : null };
        } catch (error) {
            console.error('Erro ao buscar chat por ID:', error);
            return { success: false, message: 'Erro ao buscar chat por ID' };
        }
    }

    // Arquivar chat
    async arquivarChat(IdChat, IdAdministrador = 1) {
        try {
            await pool.execute('CALL sp_chat_arquivar(?, ?)', [IdChat, IdAdministrador]);
            return { success: true };
        } catch (error) {
            console.error('Erro ao arquivar chat:', error);
            return { success: false, message: 'Erro ao arquivar chat' };
        }
    }

    // Buscar categorias de suporte
    async buscarCategoriasSuporte() {
        try {
            const [result] = await pool.execute('CALL sp_chat_buscar_categorias()');
            return { success: true, data: result[0] };
        } catch (error) {
            console.error('Erro ao buscar categorias de suporte:', error);
            return { success: false, message: 'Erro ao buscar categorias de suporte' };
        }
    }

    // Atualizar status do ticket
    async atualizarStatusTicket(IdChat, StatusSuporte, IdAdministrador = 1) {
        try {
            await pool.execute('CALL sp_chat_atualizar_status(?, ?, ?)', [IdChat, StatusSuporte, IdAdministrador]);
            return { success: true };
        } catch (error) {
            console.error('Erro ao atualizar status do ticket:', error);
            return { success: false, message: 'Erro ao atualizar status do ticket' };
        }
    }

    // Buscar estatísticas de suporte
    async buscarEstatisticasSuporte() {
        try {
            const [result] = await pool.execute('CALL sp_chat_estatisticas_suporte()');
            return { success: true, data: result[0] && result[0][0] ? result[0][0] : null };
        } catch (error) {
            console.error('Erro ao buscar estatísticas de suporte:', error);
            return { success: false, message: 'Erro ao buscar estatísticas de suporte' };
        }
    }

    // Buscar ticket por ID
    async buscarTicketPorId(IdChat) {
        try {
            const [result] = await pool.execute('CALL sp_chat_buscar_por_id(?)', [IdChat]);
            return { success: true, data: result[0] && result[0][0] ? result[0][0] : null };
        } catch (error) {
            console.error('Erro ao buscar ticket por ID:', error);
            return { success: false, message: 'Erro ao buscar ticket por ID' };
        }
    }
}

export default new ChatModel();
