// model/chatModel.js
import db from '../config/db.js';

class ChatModel {
    // Criar novo ticket de suporte
    async criarTicketSuporte(ticket) {
        const { IdUsuario, TipoUsuario, Categoria, Prioridade, Assunto, Status = 'Aberto' } = ticket;
        
        const query = `
            INSERT INTO chat (IdUsuario, TipoUsuario, Categoria, Prioridade, Assunto, StatusSuporte, Status)
            VALUES (?, ?, ?, ?, ?, ?, 'Ativo')
        `;
        
        try {
            const [result] = await db.execute(query, [IdUsuario, TipoUsuario, Categoria, Prioridade, Assunto, Status]);
            return { success: true, id: result.insertId };
        } catch (error) {
            console.error('Erro ao criar ticket de suporte:', error);
            return { success: false, message: 'Erro ao criar ticket de suporte' };
        }
    }

    // Buscar tickets de suporte de um usuário
    async buscarTicketsUsuario(IdUsuario, TipoUsuario) {
        const query = `
            SELECT 
                c.IdChat,
                c.Categoria,
                c.Prioridade,
                c.Assunto,
                c.StatusSuporte,
                c.DataCriacao,
                (SELECT COUNT(*) FROM mensagem m 
                 WHERE m.IdChat = c.IdChat AND m.Lida = 'Não' 
                 AND m.IsAdmin = TRUE) as MensagensNaoLidas,
                (SELECT m.Conteudo FROM mensagem m 
                 WHERE m.IdChat = c.IdChat 
                 ORDER BY m.DataEnvio DESC LIMIT 1) as UltimaMensagem,
                (SELECT m.DataEnvio FROM mensagem m 
                 WHERE m.IdChat = c.IdChat 
                 ORDER BY m.DataEnvio DESC LIMIT 1) as DataUltimaMensagem
            FROM chat c
            WHERE c.IdUsuario = ? AND c.TipoUsuario = ? AND c.Status = 'Ativo'
            ORDER BY c.DataCriacao DESC
        `;
        
        try {
            const [rows] = await db.execute(query, [IdUsuario, TipoUsuario]);
            return { success: true, data: rows };
        } catch (error) {
            console.error('Erro ao buscar tickets do usuário:', error);
            return { success: false, message: 'Erro ao buscar tickets do usuário' };
        }
    }

    // Buscar todos os tickets de suporte (para administradores)
    async buscarTodosTickets(filtros = {}) {
        let query = `
            SELECT 
                c.IdChat,
                c.Categoria,
                c.Prioridade,
                c.Assunto,
                c.StatusSuporte,
                c.DataCriacao,
                c.IdUsuario,
                c.TipoUsuario,
                CASE 
                    WHEN c.TipoUsuario = 'cuidador' THEN cu.Nome
                    WHEN c.TipoUsuario = 'responsavel' THEN r.Nome
                    ELSE 'Usuário'
                END as NomeUsuario,
                CASE 
                    WHEN c.TipoUsuario = 'cuidador' THEN cu.Email
                    WHEN c.TipoUsuario = 'responsavel' THEN r.Email
                    ELSE ''
                END as EmailUsuario,
                (SELECT COUNT(*) FROM mensagem m 
                 WHERE m.IdChat = c.IdChat AND m.Lida = 'Não' 
                 AND m.IsAdmin = FALSE) as MensagensNaoLidas,
                (SELECT m.Conteudo FROM mensagem m 
                 WHERE m.IdChat = c.IdChat 
                 ORDER BY m.DataEnvio DESC LIMIT 1) as UltimaMensagem,
                (SELECT m.DataEnvio FROM mensagem m 
                 WHERE m.IdChat = c.IdChat 
                 ORDER BY m.DataEnvio DESC LIMIT 1) as DataUltimaMensagem
            FROM chat c
            LEFT JOIN cuidador cu ON c.IdUsuario = cu.IdCuidador AND c.TipoUsuario = 'cuidador'
            LEFT JOIN responsavel r ON c.IdUsuario = r.IdResponsavel AND c.TipoUsuario = 'responsavel'
            WHERE c.Status = 'Ativo'
        `;
        
        let params = [];
        
        // Aplicar filtros
        if (filtros.status) {
            query += ' AND c.StatusSuporte = ?';
            params.push(filtros.status);
        }
        
        if (filtros.categoria) {
            query += ' AND c.Categoria = ?';
            params.push(filtros.categoria);
        }
        
        if (filtros.prioridade) {
            query += ' AND c.Prioridade = ?';
            params.push(filtros.prioridade);
        }
        
        query += ' ORDER BY c.DataCriacao DESC';
        
        try {
            const [rows] = await db.execute(query, params);
            return { success: true, data: rows };
        } catch (error) {
            console.error('Erro ao buscar todos os tickets:', error);
            return { success: false, message: 'Erro ao buscar todos os tickets' };
        }
    }

    // Enviar mensagem de suporte
    async enviarMensagemSuporte(mensagem) {
        const { IdChat, IdRemetente, RemetenteTipo, Conteudo, IsAdmin = false, TipoMensagem = 'Texto' } = mensagem;
        
        const query = `
            INSERT INTO mensagem (IdChat, IdRemetente, RemetenteTipo, Conteudo, Lida, IsAdmin, TipoMensagem)
            VALUES (?, ?, ?, ?, 'Não', ?, ?)
        `;
        
        try {
            const [result] = await db.execute(query, [IdChat, IdRemetente, RemetenteTipo, Conteudo, IsAdmin, TipoMensagem]);
            return { success: true, id: result.insertId };
        } catch (error) {
            console.error('Erro ao enviar mensagem de suporte:', error);
            return { success: false, message: 'Erro ao enviar mensagem de suporte' };
        }
    }

    // Buscar mensagens de suporte
    async buscarMensagensSuporte(IdChat, limite = 50) {
        const query = `
            SELECT 
                m.IdMensagem,
                m.IdRemetente,
                m.RemetenteTipo,
                m.Conteudo,
                m.DataEnvio,
                m.Lida,
                m.IsAdmin,
                m.TipoMensagem,
                CASE 
                    WHEN m.IsAdmin = TRUE THEN 'Administrador'
                    WHEN m.RemetenteTipo = 'cuidador' THEN c.Nome
                    WHEN m.RemetenteTipo = 'responsavel' THEN r.Nome
                    ELSE 'Usuário'
                END as NomeRemetente,
                CASE 
                    WHEN m.IsAdmin = TRUE THEN '/imagens/admin-avatar.png'
                    WHEN m.RemetenteTipo = 'cuidador' THEN c.FotoUrl
                    WHEN m.RemetenteTipo = 'responsavel' THEN r.FotoUrl
                    ELSE '/imagens/default-avatar.png'
                END as FotoRemetente
            FROM mensagem m
            LEFT JOIN cuidador c ON m.IdRemetente = c.IdCuidador AND m.RemetenteTipo = 'cuidador'
            LEFT JOIN responsavel r ON m.IdRemetente = r.IdResponsavel AND m.RemetenteTipo = 'responsavel'
            WHERE m.IdChat = ?
            ORDER BY m.DataEnvio ASC
            LIMIT ?
        `;
        
        try {
            const [rows] = await db.execute(query, [IdChat, limite]);
            return { success: true, data: rows };
        } catch (error) {
            console.error('Erro ao buscar mensagens de suporte:', error);
            return { success: false, message: 'Erro ao buscar mensagens de suporte' };
        }
    }

    // Marcar mensagens como lidas
    async marcarMensagensComoLidas(IdChat, IdUsuario, TipoUsuario) {
        const query = `
            UPDATE mensagem 
            SET Lida = 'Sim'
            WHERE IdChat = ? AND IdRemetente != ? AND RemetenteTipo != ?
        `;
        
        try {
            const [result] = await db.execute(query, [IdChat, IdUsuario, TipoUsuario]);
            return { success: true, affectedRows: result.affectedRows };
        } catch (error) {
            console.error('Erro ao marcar mensagens como lidas:', error);
            return { success: false, message: 'Erro ao marcar mensagens como lidas' };
        }
    }

    // Buscar contatos disponíveis para chat
    async buscarContatosDisponiveis(IdUsuario, TipoUsuario) {
        let query = '';
        let params = [];
        
        if (TipoUsuario === 'cuidador') {
            query = `
                SELECT DISTINCT
                    r.IdResponsavel,
                    r.Nome,
                    r.FotoUrl,
                    r.Email,
                    r.Telefone
                FROM responsavel r
                INNER JOIN atendimento a ON r.IdResponsavel = a.IdResponsavel
                WHERE a.IdCuidador = ? AND a.Status IN ('Concluído', 'Em Andamento')
                ORDER BY r.Nome
            `;
            params = [IdUsuario];
        } else {
            query = `
                SELECT DISTINCT
                    c.IdCuidador,
                    c.Nome,
                    c.FotoUrl,
                    c.Email,
                    c.Telefone
                FROM cuidador c
                INNER JOIN atendimento a ON c.IdCuidador = a.IdCuidador
                WHERE a.IdResponsavel = ? AND a.Status IN ('Concluído', 'Em Andamento')
                ORDER BY c.Nome
            `;
            params = [IdUsuario];
        }
        
        try {
            const [rows] = await db.execute(query, params);
            return { success: true, data: rows };
        } catch (error) {
            console.error('Erro ao buscar contatos disponíveis:', error);
            return { success: false, message: 'Erro ao buscar contatos disponíveis' };
        }
    }

    // Buscar estatísticas de chat
    async buscarEstatisticasChat(IdUsuario, TipoUsuario) {
        let query = '';
        let params = [];
        
        if (TipoUsuario === 'cuidador') {
            query = `
                SELECT 
                    COUNT(DISTINCT c.IdChat) as TotalChats,
                    COUNT(DISTINCT c.IdResponsavel) as TotalContatos,
                    (SELECT COUNT(*) FROM mensagem m 
                     INNER JOIN chat ch ON m.IdChat = ch.IdChat 
                     WHERE ch.IdCuidador = ? AND m.Lida = 'Não' 
                     AND m.RemetenteTipo = 'responsavel') as MensagensNaoLidas
                FROM chat c
                WHERE c.IdCuidador = ? AND c.Status = 'Ativo'
            `;
            params = [IdUsuario, IdUsuario];
        } else {
            query = `
                SELECT 
                    COUNT(DISTINCT c.IdChat) as TotalChats,
                    COUNT(DISTINCT c.IdCuidador) as TotalContatos,
                    (SELECT COUNT(*) FROM mensagem m 
                     INNER JOIN chat ch ON m.IdChat = ch.IdChat 
                     WHERE ch.IdResponsavel = ? AND m.Lida = 'Não' 
                     AND m.RemetenteTipo = 'cuidador') as MensagensNaoLidas
                FROM chat c
                WHERE c.IdResponsavel = ? AND c.Status = 'Ativo'
            `;
            params = [IdUsuario, IdUsuario];
        }
        
        try {
            const [rows] = await db.execute(query, params);
            return { success: true, data: rows[0] };
        } catch (error) {
            console.error('Erro ao buscar estatísticas de chat:', error);
            return { success: false, message: 'Erro ao buscar estatísticas de chat' };
        }
    }

    // Buscar chat por ID
    async buscarChatPorId(IdChat) {
        const query = `
            SELECT 
                c.IdChat,
                c.IdCuidador,
                c.IdResponsavel,
                c.DataCriacao,
                c.Status,
                cu.Nome as NomeCuidador,
                cu.FotoUrl as FotoCuidador,
                r.Nome as NomeResponsavel,
                r.FotoUrl as FotoResponsavel
            FROM chat c
            LEFT JOIN cuidador cu ON c.IdCuidador = cu.IdCuidador
            LEFT JOIN responsavel r ON c.IdResponsavel = r.IdResponsavel
            WHERE c.IdChat = ?
        `;
        
        try {
            const [rows] = await db.execute(query, [IdChat]);
            return { success: true, data: rows[0] || null };
        } catch (error) {
            console.error('Erro ao buscar chat por ID:', error);
            return { success: false, message: 'Erro ao buscar chat por ID' };
        }
    }

    // Arquivar chat
    async arquivarChat(IdChat) {
        const query = `UPDATE chat SET Status = 'Arquivado' WHERE IdChat = ?`;
        
        try {
            const [result] = await db.execute(query, [IdChat]);
            return { success: true, affectedRows: result.affectedRows };
        } catch (error) {
            console.error('Erro ao arquivar chat:', error);
            return { success: false, message: 'Erro ao arquivar chat' };
        }
    }

    // Buscar categorias de suporte
    async buscarCategoriasSuporte() {
        const query = `
            SELECT IdCategoria, Nome, Descricao, Ordem
            FROM categoriasuporte
            WHERE Ativa = TRUE
            ORDER BY Ordem ASC
        `;
        
        try {
            const [rows] = await db.execute(query);
            return { success: true, data: rows };
        } catch (error) {
            console.error('Erro ao buscar categorias de suporte:', error);
            return { success: false, message: 'Erro ao buscar categorias de suporte' };
        }
    }

    // Atualizar status do ticket
    async atualizarStatusTicket(IdChat, StatusSuporte) {
        const query = `UPDATE chat SET StatusSuporte = ? WHERE IdChat = ?`;
        
        try {
            const [result] = await db.execute(query, [StatusSuporte, IdChat]);
            return { success: true, affectedRows: result.affectedRows };
        } catch (error) {
            console.error('Erro ao atualizar status do ticket:', error);
            return { success: false, message: 'Erro ao atualizar status do ticket' };
        }
    }

    // Buscar estatísticas de suporte
    async buscarEstatisticasSuporte() {
        const query = `
            SELECT 
                COUNT(*) as TotalTickets,
                SUM(CASE WHEN StatusSuporte = 'Aberto' THEN 1 ELSE 0 END) as TicketsAbertos,
                SUM(CASE WHEN StatusSuporte = 'Em Andamento' THEN 1 ELSE 0 END) as TicketsEmAndamento,
                SUM(CASE WHEN StatusSuporte = 'Fechado' THEN 1 ELSE 0 END) as TicketsFechados,
                SUM(CASE WHEN Prioridade = 'Alta' THEN 1 ELSE 0 END) as TicketsAltaPrioridade,
                SUM(CASE WHEN DataCriacao >= DATE_SUB(NOW(), INTERVAL 24 HOUR) THEN 1 ELSE 0 END) as TicketsUltimas24h
            FROM chat
            WHERE Status = 'Ativo'
        `;
        
        try {
            const [rows] = await db.execute(query);
            return { success: true, data: rows[0] };
        } catch (error) {
            console.error('Erro ao buscar estatísticas de suporte:', error);
            return { success: false, message: 'Erro ao buscar estatísticas de suporte' };
        }
    }

    // Buscar ticket por ID
    async buscarTicketPorId(IdChat) {
        const query = `
            SELECT 
                c.IdChat,
                c.Categoria,
                c.Prioridade,
                c.Assunto,
                c.StatusSuporte,
                c.DataCriacao,
                c.IdUsuario,
                c.TipoUsuario,
                CASE 
                    WHEN c.TipoUsuario = 'cuidador' THEN cu.Nome
                    WHEN c.TipoUsuario = 'responsavel' THEN r.Nome
                    ELSE 'Usuário'
                END as NomeUsuario,
                CASE 
                    WHEN c.TipoUsuario = 'cuidador' THEN cu.Email
                    WHEN c.TipoUsuario = 'responsavel' THEN r.Email
                    ELSE ''
                END as EmailUsuario,
                CASE 
                    WHEN c.TipoUsuario = 'cuidador' THEN cu.Telefone
                    WHEN c.TipoUsuario = 'responsavel' THEN r.Telefone
                    ELSE ''
                END as TelefoneUsuario
            FROM chat c
            LEFT JOIN cuidador cu ON c.IdUsuario = cu.IdCuidador AND c.TipoUsuario = 'cuidador'
            LEFT JOIN responsavel r ON c.IdUsuario = r.IdResponsavel AND c.TipoUsuario = 'responsavel'
            WHERE c.IdChat = ?
        `;
        
        try {
            const [rows] = await db.execute(query, [IdChat]);
            return { success: true, data: rows[0] || null };
        } catch (error) {
            console.error('Erro ao buscar ticket por ID:', error);
            return { success: false, message: 'Erro ao buscar ticket por ID' };
        }
    }
}

export default new ChatModel();
