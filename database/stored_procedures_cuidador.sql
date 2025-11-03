DELIMITER $$
CREATE DEFINER=`cogitare`@`%` PROCEDURE `sp_cuidador_criar`(
    IN p_IdEndereco INT,
    IN p_Cpf VARCHAR(20),
    IN p_Nome VARCHAR(100),
    IN p_Email VARCHAR(100),
    IN p_Telefone VARCHAR(20),
    IN p_Senha VARCHAR(100),
    IN p_DataNascimento DATE,
    IN p_FotoUrl VARCHAR(255),
    IN p_Biografia TEXT,
    IN p_Fumante VARCHAR(3),
    IN p_TemFilhos VARCHAR(3),
    IN p_PossuiCNH VARCHAR(3),
    IN p_TemCarro VARCHAR(3),
    IN p_IdAdministrador INT
)
BEGIN
    DECLARE v_IdCuidador INT;
    
    -- Inserir cuidador
    INSERT INTO cuidador (
        IdEndereco, Cpf, Nome, Email, Telefone, Senha, DataNascimento, 
        FotoUrl, Biografia, Fumante, TemFilhos, PossuiCNH, TemCarro
    )
    VALUES (
        p_IdEndereco, p_Cpf, p_Nome, p_Email, p_Telefone, p_Senha, p_DataNascimento,
        p_FotoUrl, p_Biografia, p_Fumante, p_TemFilhos, p_PossuiCNH, p_TemCarro
    );
    
    SET v_IdCuidador = LAST_INSERT_ID();
    
    -- Registrar no histórico do administrador
    INSERT INTO historicoadministrador (IdAdministrador, Operacao, DataOperacao)
    VALUES (
        p_IdAdministrador,
        CONCAT('Cuidador criado (ID: ', v_IdCuidador, ') - Nome: ', p_Nome, 
               ' | Email: ', IFNULL(p_Email, 'N/A'), ' | CPF: ', IFNULL(p_Cpf, 'N/A')),
        NOW()
    );
    
    SELECT v_IdCuidador AS Id;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`cogitare`@`%` PROCEDURE `sp_cuidador_listar`()
BEGIN
    SELECT * FROM cuidador
    ORDER BY Nome;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`cogitare`@`%` PROCEDURE `sp_cuidador_buscar_por_id`(
    IN p_IdCuidador INT
)
BEGIN
    SELECT * FROM cuidador
    WHERE IdCuidador = p_IdCuidador;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`cogitare`@`%` PROCEDURE `sp_cuidador_atualizar`(
    IN p_IdCuidador INT,
    IN p_IdEndereco INT,
    IN p_Cpf VARCHAR(20),
    IN p_Nome VARCHAR(100),
    IN p_Email VARCHAR(100),
    IN p_Telefone VARCHAR(20),
    IN p_Senha VARCHAR(100),
    IN p_DataNascimento DATE,
    IN p_FotoUrl VARCHAR(255),
    IN p_Biografia TEXT,
    IN p_Fumante VARCHAR(3),
    IN p_TemFilhos VARCHAR(3),
    IN p_PossuiCNH VARCHAR(3),
    IN p_TemCarro VARCHAR(3),
    IN p_IdAdministrador INT
)
BEGIN
    DECLARE v_NomeAnterior VARCHAR(100);
    DECLARE v_Existe INT DEFAULT 0;
    
    -- Verificar se o cuidador existe e buscar nome anterior
    SELECT COUNT(*), Nome
    INTO v_Existe, v_NomeAnterior
    FROM cuidador
    WHERE IdCuidador = p_IdCuidador;
    
    IF v_Existe = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Cuidador não encontrado';
    END IF;
    
    -- Atualizar cuidador
    UPDATE cuidador 
    SET 
        IdEndereco = p_IdEndereco,
        Cpf = p_Cpf,
        Nome = p_Nome,
        Email = p_Email,
        Telefone = p_Telefone,
        Senha = p_Senha,
        DataNascimento = p_DataNascimento,
        FotoUrl = p_FotoUrl,
        Biografia = p_Biografia,
        Fumante = p_Fumante,
        TemFilhos = p_TemFilhos,
        PossuiCNH = p_PossuiCNH,
        TemCarro = p_TemCarro
    WHERE IdCuidador = p_IdCuidador;
    
    -- Registrar no histórico do administrador
    INSERT INTO historicoadministrador (IdAdministrador, Operacao, DataOperacao)
    VALUES (
        p_IdAdministrador,
        CONCAT('Cuidador atualizado (ID: ', p_IdCuidador, ') - Nome: ', IFNULL(v_NomeAnterior, 'N/A'), 
               ' para ', p_Nome, 
               ' | Email: ', IFNULL(p_Email, 'N/A'), ' | Telefone: ', IFNULL(p_Telefone, 'N/A')),
        NOW()
    );
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`cogitare`@`%` PROCEDURE `sp_cuidador_excluir`(
    IN p_IdCuidador INT,
    IN p_IdAdministrador INT
)
BEGIN
    DECLARE v_Nome VARCHAR(100);
    DECLARE v_Email VARCHAR(100);
    DECLARE v_Existe INT DEFAULT 0;
    
    -- Verificar se o cuidador existe e buscar dados
    SELECT COUNT(*), Nome, Email
    INTO v_Existe, v_Nome, v_Email
    FROM cuidador
    WHERE IdCuidador = p_IdCuidador;
    
    IF v_Existe = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Cuidador não encontrado';
    END IF;
    
    -- Registrar no histórico do administrador ANTES de excluir
    INSERT INTO historicoadministrador (IdAdministrador, Operacao, DataOperacao)
    VALUES (
        p_IdAdministrador,
        CONCAT('Cuidador excluído (ID: ', p_IdCuidador, ') - Nome: ', IFNULL(v_Nome, 'N/A'), 
               ' | Email: ', IFNULL(v_Email, 'N/A')),
        NOW()
    );
    
    -- Excluir dados relacionados aos atendimentos primeiro
    DELETE FROM avaliacao WHERE IdCuidador = p_IdCuidador;
    DELETE FROM comissao WHERE IdCuidador = p_IdCuidador;
    
    -- Excluir atendimentos (isto causará CASCADE para avaliações, pagamentos, receitas, histórico)
    DELETE FROM atendimento WHERE IdCuidador = p_IdCuidador;
    
    -- Excluir chats e mensagens relacionadas
    DELETE m FROM mensagem m
    INNER JOIN chat c ON m.IdChat = c.IdChat
    WHERE c.IdCuidador = p_IdCuidador;
    
    DELETE FROM chat WHERE IdCuidador = p_IdCuidador;
    
    -- Excluir dados auxiliares (muitos com CASCADE, mas por segurança)
    DELETE FROM cuidadorespecialidade WHERE IdCuidador = p_IdCuidador;
    DELETE FROM cuidadorservico WHERE IdCuidador = p_IdCuidador;
    DELETE FROM certificado WHERE IdCuidador = p_IdCuidador;
    DELETE FROM experiencia WHERE IdCuidador = p_IdCuidador;
    DELETE FROM formacao WHERE IdCuidador = p_IdCuidador;
    DELETE FROM disponibilidade WHERE IdCuidador = p_IdCuidador;
    DELETE FROM registroprofissional WHERE IdCuidador = p_IdCuidador;
    DELETE FROM historicocuidador WHERE IdCuidador = p_IdCuidador;
    DELETE FROM despesa WHERE IdCuidador = p_IdCuidador;
    
    -- Finalmente, excluir o cuidador
    DELETE FROM cuidador WHERE IdCuidador = p_IdCuidador;
END$$
DELIMITER ;

