DELIMITER $$
CREATE DEFINER=`cogitare`@`%` PROCEDURE `sp_atendimento_criar`(
    IN p_IdResponsavel INT,
    IN p_IdCuidador INT,
    IN p_IdIdoso INT,
    IN p_DataInicio DATETIME,
    IN p_DataFim DATETIME,
    IN p_Status VARCHAR(20),
    IN p_Local VARCHAR(255),
    IN p_Valor DECIMAL(10,2),
    IN p_ObservacaoExtra TEXT,
    IN p_IdAdministrador INT
)
BEGIN
    DECLARE v_NomeResponsavel VARCHAR(100);
    DECLARE v_NomeCuidador VARCHAR(100);
    DECLARE v_NomeIdoso VARCHAR(100);
    DECLARE v_IdAtendimento INT;
    
    -- Buscar nomes para o log
    SELECT Nome INTO v_NomeResponsavel FROM responsavel WHERE IdResponsavel = p_IdResponsavel;
    SELECT Nome INTO v_NomeCuidador FROM cuidador WHERE IdCuidador = p_IdCuidador;
    SELECT Nome INTO v_NomeIdoso FROM idoso WHERE IdIdoso = p_IdIdoso;
    
    -- Inserir atendimento
    INSERT INTO atendimento (
        IdResponsavel, IdCuidador, IdIdoso, DataInicio, DataFim, 
        Status, Local, Valor, ObservacaoExtra
    )
    VALUES (
        p_IdResponsavel, p_IdCuidador, p_IdIdoso, p_DataInicio, p_DataFim,
        p_Status, p_Local, p_Valor, p_ObservacaoExtra
    );
    
    SET v_IdAtendimento = LAST_INSERT_ID();
    
    -- Registrar no histórico do administrador
    INSERT INTO historicoadministrador (IdAdministrador, Operacao, DataOperacao)
    VALUES (
        p_IdAdministrador,
        CONCAT('Atendimento criado (ID: ', v_IdAtendimento, ') - Responsável: ', IFNULL(v_NomeResponsavel, 'N/A'), 
               ' | Cuidador: ', IFNULL(v_NomeCuidador, 'N/A'), 
               ' | Idoso: ', IFNULL(v_NomeIdoso, 'N/A'), 
               ' | Valor: R$ ', IFNULL(FORMAT(p_Valor, 2, 'pt_BR'), '0,00')),
        NOW()
    );
    
    SELECT v_IdAtendimento AS Id;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`cogitare`@`%` PROCEDURE `sp_atendimento_listar`()
BEGIN
    SELECT 
        a.*, 
        r.Nome AS NomeResponsavel, 
        i.Nome AS NomeIdoso, 
        c.Nome AS NomeCuidador
    FROM atendimento a
    LEFT JOIN responsavel r ON a.IdResponsavel = r.IdResponsavel
    LEFT JOIN idoso i ON a.IdIdoso = i.IdIdoso
    LEFT JOIN cuidador c ON a.IdCuidador = c.IdCuidador
    ORDER BY a.DataInicio DESC;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`cogitare`@`%` PROCEDURE `sp_atendimento_buscar_por_id`(
    IN p_IdAtendimento INT
)
BEGIN
    SELECT 
        a.*, 
        r.Nome AS NomeResponsavel, 
        i.Nome AS NomeIdoso, 
        c.Nome AS NomeCuidador
    FROM atendimento a
    LEFT JOIN responsavel r ON a.IdResponsavel = r.IdResponsavel
    LEFT JOIN idoso i ON a.IdIdoso = i.IdIdoso
    LEFT JOIN cuidador c ON a.IdCuidador = c.IdCuidador
    WHERE a.IdAtendimento = p_IdAtendimento;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`cogitare`@`%` PROCEDURE `sp_atendimento_atualizar_status`(
    IN p_IdAtendimento INT,
    IN p_Status VARCHAR(20),
    IN p_IdAdministrador INT
)
BEGIN
    DECLARE v_NomeResponsavel VARCHAR(100);
    DECLARE v_NomeCuidador VARCHAR(100);
    DECLARE v_NomeIdoso VARCHAR(100);
    DECLARE v_StatusAnterior VARCHAR(20);
    
    -- Buscar dados do atendimento
    SELECT 
        a.Status,
        r.Nome,
        c.Nome,
        i.Nome
    INTO 
        v_StatusAnterior,
        v_NomeResponsavel,
        v_NomeCuidador,
        v_NomeIdoso
    FROM atendimento a
    LEFT JOIN responsavel r ON a.IdResponsavel = r.IdResponsavel
    LEFT JOIN cuidador c ON a.IdCuidador = c.IdCuidador
    LEFT JOIN idoso i ON a.IdIdoso = i.IdIdoso
    WHERE a.IdAtendimento = p_IdAtendimento;
    
    -- Verificar se o atendimento existe
    IF v_StatusAnterior IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Atendimento não encontrado';
    END IF;
    
    -- Atualizar status
    UPDATE atendimento 
    SET Status = p_Status 
    WHERE IdAtendimento = p_IdAtendimento;
    
    -- Registrar no histórico do administrador
    INSERT INTO historicoadministrador (IdAdministrador, Operacao, DataOperacao)
    VALUES (
        p_IdAdministrador,
        CONCAT('Status do atendimento (ID: ', p_IdAtendimento, ') alterado de "', 
               IFNULL(v_StatusAnterior, 'N/A'), '" para "', p_Status, 
               '" - Idoso: ', IFNULL(v_NomeIdoso, 'N/A')),
        NOW()
    );
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`cogitare`@`%` PROCEDURE `sp_atendimento_atualizar`(
    IN p_IdAtendimento INT,
    IN p_IdResponsavel INT,
    IN p_IdCuidador INT,
    IN p_IdIdoso INT,
    IN p_DataInicio DATETIME,
    IN p_DataFim DATETIME,
    IN p_Status VARCHAR(20),
    IN p_Local VARCHAR(255),
    IN p_Valor DECIMAL(10,2),
    IN p_ObservacaoExtra TEXT,
    IN p_IdAdministrador INT
)
BEGIN
    DECLARE v_NomeResponsavel VARCHAR(100);
    DECLARE v_NomeCuidador VARCHAR(100);
    DECLARE v_NomeIdoso VARCHAR(100);
    DECLARE v_Existe INT DEFAULT 0;
    
    -- Verificar se o atendimento existe
    SELECT COUNT(*) INTO v_Existe FROM atendimento WHERE IdAtendimento = p_IdAtendimento;
    
    IF v_Existe = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Atendimento não encontrado';
    END IF;
    
    -- Buscar nomes para o log
    SELECT Nome INTO v_NomeResponsavel FROM responsavel WHERE IdResponsavel = p_IdResponsavel;
    SELECT Nome INTO v_NomeCuidador FROM cuidador WHERE IdCuidador = p_IdCuidador;
    SELECT Nome INTO v_NomeIdoso FROM idoso WHERE IdIdoso = p_IdIdoso;
    
    -- Atualizar atendimento
    UPDATE atendimento
    SET 
        IdResponsavel = p_IdResponsavel,
        IdCuidador = p_IdCuidador,
        IdIdoso = p_IdIdoso,
        DataInicio = p_DataInicio,
        DataFim = p_DataFim,
        Status = p_Status,
        Local = p_Local,
        Valor = p_Valor,
        ObservacaoExtra = p_ObservacaoExtra
    WHERE IdAtendimento = p_IdAtendimento;
    
    -- Registrar no histórico do administrador
    INSERT INTO historicoadministrador (IdAdministrador, Operacao, DataOperacao)
    VALUES (
        p_IdAdministrador,
        CONCAT('Atendimento (ID: ', p_IdAtendimento, ') alterado - Responsável: ', IFNULL(v_NomeResponsavel, 'N/A'), 
               ' | Cuidador: ', IFNULL(v_NomeCuidador, 'N/A'), 
               ' | Idoso: ', IFNULL(v_NomeIdoso, 'N/A'), 
               ' | Status: ', p_Status, 
               ' | Valor: R$ ', IFNULL(FORMAT(p_Valor, 2, 'pt_BR'), '0,00')),
        NOW()
    );
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`cogitare`@`%` PROCEDURE `sp_atendimento_excluir`(
    IN p_IdAtendimento INT,
    IN p_IdAdministrador INT
)
BEGIN
    DECLARE v_NomeResponsavel VARCHAR(100);
    DECLARE v_NomeCuidador VARCHAR(100);
    DECLARE v_NomeIdoso VARCHAR(100);
    DECLARE v_Status VARCHAR(20);
    DECLARE v_Valor DECIMAL(10,2);
    DECLARE v_Existe INT DEFAULT 0;
    
    -- Verificar se o atendimento existe e buscar dados
    SELECT 
        COUNT(*),
        r.Nome,
        c.Nome,
        i.Nome,
        a.Status,
        a.Valor
    INTO 
        v_Existe,
        v_NomeResponsavel,
        v_NomeCuidador,
        v_NomeIdoso,
        v_Status,
        v_Valor
    FROM atendimento a
    LEFT JOIN responsavel r ON a.IdResponsavel = r.IdResponsavel
    LEFT JOIN cuidador c ON a.IdCuidador = c.IdCuidador
    LEFT JOIN idoso i ON a.IdIdoso = i.IdIdoso
    WHERE a.IdAtendimento = p_IdAtendimento;
    
    IF v_Existe = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Atendimento não encontrado';
    END IF;
    
    -- Registrar no histórico do administrador ANTES de excluir
    INSERT INTO historicoadministrador (IdAdministrador, Operacao, DataOperacao)
    VALUES (
        p_IdAdministrador,
        CONCAT('Atendimento excluído (ID: ', p_IdAtendimento, ') - Responsável: ', IFNULL(v_NomeResponsavel, 'N/A'), 
               ' | Cuidador: ', IFNULL(v_NomeCuidador, 'N/A'), 
               ' | Idoso: ', IFNULL(v_NomeIdoso, 'N/A'), 
               ' | Status: ', IFNULL(v_Status, 'N/A'), 
               ' | Valor: R$ ', IFNULL(FORMAT(v_Valor, 2, 'pt_BR'), '0,00')),
        NOW()
    );
    
    -- Excluir atendimento
    DELETE FROM atendimento WHERE IdAtendimento = p_IdAtendimento;
END$$
DELIMITER ;

