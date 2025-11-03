DELIMITER $$
CREATE DEFINER=`cogitare`@`%` PROCEDURE `sp_chat_criar_ticket`(
    IN p_IdUsuario INT,
    IN p_TipoUsuario VARCHAR(20),
    IN p_Categoria VARCHAR(50),
    IN p_Prioridade VARCHAR(20),
    IN p_Assunto VARCHAR(200),
    IN p_StatusSuporte VARCHAR(20),
    IN p_IdAdministrador INT
)
BEGIN
    DECLARE v_NomeUsuario VARCHAR(100);
    DECLARE v_IdChat INT;
    
    -- Buscar nome do usuário para o log
    IF p_TipoUsuario = 'cuidador' THEN
        SELECT Nome INTO v_NomeUsuario FROM cuidador WHERE IdCuidador = p_IdUsuario;
    ELSEIF p_TipoUsuario = 'responsavel' THEN
        SELECT Nome INTO v_NomeUsuario FROM responsavel WHERE IdResponsavel = p_IdUsuario;
    END IF;
    
    -- Inserir ticket
    INSERT INTO chat (IdUsuario, TipoUsuario, Categoria, Prioridade, Assunto, StatusSuporte, Status)
    VALUES (p_IdUsuario, p_TipoUsuario, p_Categoria, p_Prioridade, p_Assunto, p_StatusSuporte, 'Ativo');
    
    SET v_IdChat = LAST_INSERT_ID();
    
    -- Registrar no histórico do administrador
    INSERT INTO historicoadministrador (IdAdministrador, Operacao, DataOperacao)
    VALUES (
        p_IdAdministrador,
        CONCAT('Ticket de suporte criado (ID: ', v_IdChat, ') - Tipo: ', p_TipoUsuario, 
               ' | Categoria: ', p_Categoria, 
               ' | Prioridade: ', p_Prioridade, 
               ' | Usuário: ', IFNULL(v_NomeUsuario, 'N/A')),
        NOW()
    );
    
    SELECT v_IdChat AS Id;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`cogitare`@`%` PROCEDURE `sp_chat_buscar_tickets_usuario`(
    IN p_IdUsuario INT,
    IN p_TipoUsuario VARCHAR(20)
)
BEGIN
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
    WHERE c.IdUsuario = p_IdUsuario AND c.TipoUsuario = p_TipoUsuario AND c.Status = 'Ativo'
    ORDER BY c.DataCriacao DESC;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`cogitare`@`%` PROCEDURE `sp_chat_buscar_todos_tickets`(
    IN p_StatusSuporte VARCHAR(20),
    IN p_Categoria VARCHAR(50),
    IN p_Prioridade VARCHAR(20)
)
BEGIN
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
    AND (p_StatusSuporte IS NULL OR c.StatusSuporte = p_StatusSuporte)
    AND (p_Categoria IS NULL OR c.Categoria = p_Categoria)
    AND (p_Prioridade IS NULL OR c.Prioridade = p_Prioridade)
    ORDER BY c.DataCriacao DESC;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`cogitare`@`%` PROCEDURE `sp_chat_enviar_mensagem`(
    IN p_IdChat INT,
    IN p_IdRemetente INT,
    IN p_RemetenteTipo VARCHAR(20),
    IN p_Conteudo TEXT,
    IN p_IsAdmin BOOLEAN,
    IN p_TipoMensagem VARCHAR(20),
    IN p_IdAdministrador INT
)
BEGIN
    DECLARE v_NomeRemetente VARCHAR(100);
    DECLARE v_AssuntoTicket VARCHAR(200);
    DECLARE v_IdMensagem INT;
    
    -- Buscar informações para o log (se for admin)
    IF p_IsAdmin = TRUE THEN
        SELECT Assunto INTO v_AssuntoTicket FROM chat WHERE IdChat = p_IdChat;
        
        -- Registrar no histórico do administrador
        INSERT INTO historicoadministrador (IdAdministrador, Operacao, DataOperacao)
        VALUES (
            p_IdAdministrador,
            CONCAT('Mensagem enviada no ticket (ID: ', p_IdChat, ') - Assunto: ', IFNULL(v_AssuntoTicket, 'N/A')),
            NOW()
        );
    END IF;
    
    -- Inserir mensagem
    INSERT INTO mensagem (IdChat, IdRemetente, RemetenteTipo, Conteudo, Lida, IsAdmin, TipoMensagem)
    VALUES (p_IdChat, p_IdRemetente, p_RemetenteTipo, p_Conteudo, 'Não', p_IsAdmin, p_TipoMensagem);
    
    SET v_IdMensagem = LAST_INSERT_ID();
    
    SELECT v_IdMensagem AS Id;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`cogitare`@`%` PROCEDURE `sp_chat_buscar_mensagens`(
    IN p_IdChat INT,
    IN p_Limite INT
)
BEGIN
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
            WHEN m.IsAdmin = TRUE THEN NULL
            WHEN m.RemetenteTipo = 'cuidador' THEN c.FotoUrl
            WHEN m.RemetenteTipo = 'responsavel' THEN r.FotoUrl
            ELSE NULL
        END as FotoRemetente
    FROM mensagem m
    LEFT JOIN cuidador c ON m.IdRemetente = c.IdCuidador AND m.RemetenteTipo = 'cuidador'
    LEFT JOIN responsavel r ON m.IdRemetente = r.IdResponsavel AND m.RemetenteTipo = 'responsavel'
    WHERE m.IdChat = p_IdChat
    ORDER BY m.DataEnvio ASC
    LIMIT p_Limite;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`cogitare`@`%` PROCEDURE `sp_chat_marcar_mensagens_lidas`(
    IN p_IdChat INT,
    IN p_IdUsuario INT,
    IN p_TipoUsuario VARCHAR(20)
)
BEGIN
    UPDATE mensagem 
    SET Lida = 'Sim'
    WHERE IdChat = p_IdChat AND IdRemetente != p_IdUsuario AND RemetenteTipo != p_TipoUsuario;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`cogitare`@`%` PROCEDURE `sp_chat_atualizar_status`(
    IN p_IdChat INT,
    IN p_StatusSuporte VARCHAR(20),
    IN p_IdAdministrador INT
)
BEGIN
    DECLARE v_Assunto VARCHAR(200);
    DECLARE v_StatusAnterior VARCHAR(20);
    DECLARE v_Existe INT DEFAULT 0;
    
    -- Verificar se o ticket existe e buscar dados
    SELECT 
        COUNT(*),
        Assunto,
        StatusSuporte
    INTO 
        v_Existe,
        v_Assunto,
        v_StatusAnterior
    FROM chat
    WHERE IdChat = p_IdChat;
    
    IF v_Existe = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Ticket não encontrado';
    END IF;
    
    -- Atualizar status
    UPDATE chat 
    SET StatusSuporte = p_StatusSuporte
    WHERE IdChat = p_IdChat;
    
    -- Registrar no histórico do administrador
    INSERT INTO historicoadministrador (IdAdministrador, Operacao, DataOperacao)
    VALUES (
        p_IdAdministrador,
        CONCAT('Status do ticket atualizado (ID: ', p_IdChat, ') - De "', 
               IFNULL(v_StatusAnterior, 'N/A'), '" para "', p_StatusSuporte, 
               '" | Assunto: ', IFNULL(v_Assunto, 'N/A')),
        NOW()
    );
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`cogitare`@`%` PROCEDURE `sp_chat_arquivar`(
    IN p_IdChat INT,
    IN p_IdAdministrador INT
)
BEGIN
    DECLARE v_Assunto VARCHAR(200);
    DECLARE v_Categoria VARCHAR(50);
    DECLARE v_Existe INT DEFAULT 0;
    
    -- Verificar se o chat existe e buscar dados
    SELECT 
        COUNT(*),
        Assunto,
        Categoria
    INTO 
        v_Existe,
        v_Assunto,
        v_Categoria
    FROM chat
    WHERE IdChat = p_IdChat;
    
    IF v_Existe = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Chat não encontrado';
    END IF;
    
    -- Registrar no histórico do administrador ANTES de arquivar
    INSERT INTO historicoadministrador (IdAdministrador, Operacao, DataOperacao)
    VALUES (
        p_IdAdministrador,
        CONCAT('Chat arquivado (ID: ', p_IdChat, ') - Categoria: ', IFNULL(v_Categoria, 'N/A'), 
               ' | Assunto: ', IFNULL(v_Assunto, 'N/A')),
        NOW()
    );
    
    -- Arquivar chat
    UPDATE chat 
    SET Status = 'Arquivado'
    WHERE IdChat = p_IdChat;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`cogitare`@`%` PROCEDURE `sp_chat_buscar_por_id`(
    IN p_IdChat INT
)
BEGIN
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
    WHERE c.IdChat = p_IdChat;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`cogitare`@`%` PROCEDURE `sp_chat_buscar_chat_por_id`(
    IN p_IdChat INT
)
BEGIN
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
    WHERE c.IdChat = p_IdChat;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`cogitare`@`%` PROCEDURE `sp_chat_buscar_contatos_cuidador`(
    IN p_IdCuidador INT
)
BEGIN
    SELECT DISTINCT
        r.IdResponsavel,
        r.Nome,
        r.FotoUrl,
        r.Email,
        r.Telefone
    FROM responsavel r
    INNER JOIN atendimento a ON r.IdResponsavel = a.IdResponsavel
    WHERE a.IdCuidador = p_IdCuidador AND a.Status IN ('Concluído', 'Em Andamento')
    ORDER BY r.Nome;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`cogitare`@`%` PROCEDURE `sp_chat_buscar_contatos_responsavel`(
    IN p_IdResponsavel INT
)
BEGIN
    SELECT DISTINCT
        c.IdCuidador,
        c.Nome,
        c.FotoUrl,
        c.Email,
        c.Telefone
    FROM cuidador c
    INNER JOIN atendimento a ON c.IdCuidador = a.IdCuidador
    WHERE a.IdResponsavel = p_IdResponsavel AND a.Status IN ('Concluído', 'Em Andamento')
    ORDER BY c.Nome;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`cogitare`@`%` PROCEDURE `sp_chat_estatisticas_cuidador`(
    IN p_IdCuidador INT
)
BEGIN
    SELECT 
        COUNT(DISTINCT c.IdChat) as TotalChats,
        COUNT(DISTINCT c.IdResponsavel) as TotalContatos,
        (SELECT COUNT(*) FROM mensagem m 
         INNER JOIN chat ch ON m.IdChat = ch.IdChat 
         WHERE ch.IdCuidador = p_IdCuidador AND m.Lida = 'Não' 
         AND m.RemetenteTipo = 'responsavel') as MensagensNaoLidas
    FROM chat c
    WHERE c.IdCuidador = p_IdCuidador AND c.Status = 'Ativo';
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`cogitare`@`%` PROCEDURE `sp_chat_estatisticas_responsavel`(
    IN p_IdResponsavel INT
)
BEGIN
    SELECT 
        COUNT(DISTINCT c.IdChat) as TotalChats,
        COUNT(DISTINCT c.IdCuidador) as TotalContatos,
        (SELECT COUNT(*) FROM mensagem m 
         INNER JOIN chat ch ON m.IdChat = ch.IdChat 
         WHERE ch.IdResponsavel = p_IdResponsavel AND m.Lida = 'Não' 
         AND m.RemetenteTipo = 'cuidador') as MensagensNaoLidas
    FROM chat c
    WHERE c.IdResponsavel = p_IdResponsavel AND c.Status = 'Ativo';
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`cogitare`@`%` PROCEDURE `sp_chat_buscar_categorias`()
BEGIN
    SELECT IdCategoria, Nome, Descricao, Ordem
    FROM categoriasuporte
    WHERE Ativa = TRUE
    ORDER BY Ordem ASC;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`cogitare`@`%` PROCEDURE `sp_chat_estatisticas_suporte`()
BEGIN
    SELECT 
        COUNT(*) as TotalTickets,
        SUM(CASE WHEN StatusSuporte = 'Aberto' THEN 1 ELSE 0 END) as TicketsAbertos,
        SUM(CASE WHEN StatusSuporte = 'Em Andamento' THEN 1 ELSE 0 END) as TicketsEmAndamento,
        SUM(CASE WHEN StatusSuporte = 'Fechado' THEN 1 ELSE 0 END) as TicketsFechados,
        SUM(CASE WHEN Prioridade = 'Alta' THEN 1 ELSE 0 END) as TicketsAltaPrioridade,
        SUM(CASE WHEN DataCriacao >= DATE_SUB(NOW(), INTERVAL 24 HOUR) THEN 1 ELSE 0 END) as TicketsUltimas24h
    FROM chat
    WHERE Status = 'Ativo';
END$$
DELIMITER ;

