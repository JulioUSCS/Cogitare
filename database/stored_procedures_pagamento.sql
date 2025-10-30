DELIMITER $$

-- Listar pagamentos com joins
CREATE DEFINER=`cogitare`@`%` PROCEDURE `sp_pagamento_listar`()
BEGIN
    SELECT 
        p.IdPagamento,
        p.IdAtendimento,
        p.MetodoPagamento,
        p.StatusPagamento,
        p.DataPagamento,
        p.CodigoTransacao,
        r.Nome as NomeResponsavel,
        r.Email as EmailResponsavel,
        r.Telefone as TelefoneResponsavel,
        c.Nome as NomeCuidador,
        c.Email as EmailCuidador,
        i.Nome as NomeIdoso,
        a.DataInicio,
        a.DataFim,
        a.Valor,
        a.Status as StatusAtendimento
    FROM pagamento p
    INNER JOIN atendimento a ON p.IdAtendimento = a.IdAtendimento
    INNER JOIN responsavel r ON a.IdResponsavel = r.IdResponsavel
    INNER JOIN cuidador c ON a.IdCuidador = c.IdCuidador
    INNER JOIN idoso i ON a.IdIdoso = i.IdIdoso
    ORDER BY p.DataPagamento DESC;
END$$

DELIMITER ;

DELIMITER $$
-- Buscar por ID
CREATE DEFINER=`cogitare`@`%` PROCEDURE `sp_pagamento_buscar_por_id`(
    IN p_IdPagamento INT
)
BEGIN
    SELECT 
        p.IdPagamento,
        p.IdAtendimento,
        p.MetodoPagamento,
        p.StatusPagamento,
        p.DataPagamento,
        p.CodigoTransacao,
        r.Nome as NomeResponsavel,
        r.Email as EmailResponsavel,
        r.Telefone as TelefoneResponsavel,
        c.Nome as NomeCuidador,
        c.Email as EmailCuidador,
        i.Nome as NomeIdoso,
        a.DataInicio,
        a.DataFim,
        a.Valor,
        a.Status as StatusAtendimento
    FROM pagamento p
    INNER JOIN atendimento a ON p.IdAtendimento = a.IdAtendimento
    INNER JOIN responsavel r ON a.IdResponsavel = r.IdResponsavel
    INNER JOIN cuidador c ON a.IdCuidador = c.IdCuidador
    INNER JOIN idoso i ON a.IdIdoso = i.IdIdoso
    WHERE p.IdPagamento = p_IdPagamento
    LIMIT 1;
END$$
DELIMITER ;

DELIMITER $$
-- Buscar por responsável
CREATE DEFINER=`cogitare`@`%` PROCEDURE `sp_pagamento_buscar_por_responsavel`(
    IN p_IdResponsavel INT
)
BEGIN
    SELECT 
        p.IdPagamento,
        p.IdAtendimento,
        p.MetodoPagamento,
        p.StatusPagamento,
        p.DataPagamento,
        p.CodigoTransacao,
        r.Nome as NomeResponsavel,
        r.Email as EmailResponsavel,
        r.Telefone as TelefoneResponsavel,
        c.Nome as NomeCuidador,
        c.Email as EmailCuidador,
        i.Nome as NomeIdoso,
        a.DataInicio,
        a.DataFim,
        a.Valor,
        a.Status as StatusAtendimento
    FROM pagamento p
    INNER JOIN atendimento a ON p.IdAtendimento = a.IdAtendimento
    INNER JOIN responsavel r ON a.IdResponsavel = r.IdResponsavel
    INNER JOIN cuidador c ON a.IdCuidador = c.IdCuidador
    INNER JOIN idoso i ON a.IdIdoso = i.IdIdoso
    WHERE a.IdResponsavel = p_IdResponsavel
    ORDER BY p.DataPagamento DESC;
END$$
DELIMITER ;

DELIMITER $$
-- Buscar por status
CREATE DEFINER=`cogitare`@`%` PROCEDURE `sp_pagamento_buscar_por_status`(
    IN p_Status VARCHAR(20)
)
BEGIN
    SELECT 
        p.IdPagamento,
        p.IdAtendimento,
        p.MetodoPagamento,
        p.StatusPagamento,
        p.DataPagamento,
        p.CodigoTransacao,
        r.Nome as NomeResponsavel,
        r.Email as EmailResponsavel,
        r.Telefone as TelefoneResponsavel,
        c.Nome as NomeCuidador,
        c.Email as EmailCuidador,
        i.Nome as NomeIdoso,
        a.DataInicio,
        a.DataFim,
        a.Valor,
        a.Status as StatusAtendimento
    FROM pagamento p
    INNER JOIN atendimento a ON p.IdAtendimento = a.IdAtendimento
    INNER JOIN responsavel r ON a.IdResponsavel = r.IdResponsavel
    INNER JOIN cuidador c ON a.IdCuidador = c.IdCuidador
    INNER JOIN idoso i ON a.IdIdoso = i.IdIdoso
    WHERE p.StatusPagamento = p_Status
    ORDER BY p.DataPagamento DESC;
END$$
DELIMITER ;

DELIMITER $$
-- Criar pagamento
CREATE DEFINER=`cogitare`@`%` PROCEDURE `sp_pagamento_criar`(
    IN p_IdAtendimento INT,
    IN p_MetodoPagamento VARCHAR(20),
    IN p_StatusPagamento VARCHAR(20),
    IN p_CodigoTransacao VARCHAR(255)
)
BEGIN
    INSERT INTO pagamento (IdAtendimento, MetodoPagamento, StatusPagamento, CodigoTransacao)
    VALUES (p_IdAtendimento, p_MetodoPagamento, p_StatusPagamento, p_CodigoTransacao);
    SELECT LAST_INSERT_ID() AS Id;
END$$
DELIMITER ;

DELIMITER $$
-- Atualizar pagamento
CREATE DEFINER=`cogitare`@`%` PROCEDURE `sp_pagamento_atualizar`(
    IN p_IdPagamento INT,
    IN p_MetodoPagamento VARCHAR(20),
    IN p_StatusPagamento VARCHAR(20),
    IN p_CodigoTransacao VARCHAR(255)
)
BEGIN
    UPDATE pagamento 
    SET MetodoPagamento = p_MetodoPagamento,
        StatusPagamento = p_StatusPagamento,
        CodigoTransacao = p_CodigoTransacao
    WHERE IdPagamento = p_IdPagamento;
END$$
DELIMITER ;

DELIMITER $$
-- Excluir pagamento
CREATE DEFINER=`cogitare`@`%` PROCEDURE `sp_pagamento_excluir`(
    IN p_IdPagamento INT
)
BEGIN
    DELETE FROM pagamento WHERE IdPagamento = p_IdPagamento;
END$$
DELIMITER ;


