DELIMITER $$
CREATE DEFINER=`cogitare`@`%` PROCEDURE `sp_avaliacao_criar`(
    IN p_IdResponsavel INT,
    IN p_IdCuidador INT,
    IN p_IdAtendimento INT,
    IN p_Nota INT,
    IN p_Comentario TEXT,
    IN p_IdAdministrador INT
)
BEGIN
    DECLARE v_NomeResponsavel VARCHAR(100);
    DECLARE v_NomeCuidador VARCHAR(100);
    DECLARE v_NomeIdoso VARCHAR(100);
    DECLARE v_IdAvaliacao INT;
    
    -- Buscar nomes para o log
    SELECT Nome INTO v_NomeResponsavel FROM responsavel WHERE IdResponsavel = p_IdResponsavel;
    SELECT Nome INTO v_NomeCuidador FROM cuidador WHERE IdCuidador = p_IdCuidador;
    SELECT Nome INTO v_NomeIdoso 
    FROM idoso i
    INNER JOIN atendimento a ON i.IdIdoso = a.IdIdoso
    WHERE a.IdAtendimento = p_IdAtendimento;
    
    -- Inserir avaliação
    INSERT INTO avaliacao (IdResponsavel, IdCuidador, IdAtendimento, Nota, Comentario)
    VALUES (p_IdResponsavel, p_IdCuidador, p_IdAtendimento, p_Nota, p_Comentario);
    
    SET v_IdAvaliacao = LAST_INSERT_ID();
    
    -- Registrar no histórico do administrador
    INSERT INTO historicoadministrador (IdAdministrador, Operacao, DataOperacao)
    VALUES (
        p_IdAdministrador,
        CONCAT('Avaliação criada (ID: ', v_IdAvaliacao, ') - Nota: ', p_Nota, 
               ' | Responsável: ', IFNULL(v_NomeResponsavel, 'N/A'), 
               ' | Cuidador: ', IFNULL(v_NomeCuidador, 'N/A'), 
               ' | Idoso: ', IFNULL(v_NomeIdoso, 'N/A'), 
               ' | Atendimento ID: ', IFNULL(p_IdAtendimento, 'N/A')),
        NOW()
    );
    
    SELECT v_IdAvaliacao AS Id;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`cogitare`@`%` PROCEDURE `sp_avaliacao_listar`()
BEGIN
    SELECT 
        a.IdAvaliacao,
        a.Nota,
        a.Comentario,
        a.DataAvaliacao,
        a.IdResponsavel,
        a.IdCuidador,
        a.IdAtendimento,
        r.Nome as NomeResponsavel,
        c.Nome as NomeCuidador,
        at.DataInicio,
        at.DataFim,
        i.Nome as NomeIdoso
    FROM avaliacao a
    LEFT JOIN responsavel r ON a.IdResponsavel = r.IdResponsavel
    LEFT JOIN cuidador c ON a.IdCuidador = c.IdCuidador
    LEFT JOIN atendimento at ON a.IdAtendimento = at.IdAtendimento
    LEFT JOIN idoso i ON at.IdIdoso = i.IdIdoso
    ORDER BY a.DataAvaliacao DESC;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`cogitare`@`%` PROCEDURE `sp_avaliacao_buscar_por_id`(
    IN p_IdAvaliacao INT
)
BEGIN
    SELECT 
        a.IdAvaliacao,
        a.Nota,
        a.Comentario,
        a.DataAvaliacao,
        a.IdResponsavel,
        a.IdCuidador,
        a.IdAtendimento,
        r.Nome as NomeResponsavel,
        c.Nome as NomeCuidador,
        at.DataInicio,
        at.DataFim,
        i.Nome as NomeIdoso
    FROM avaliacao a
    LEFT JOIN responsavel r ON a.IdResponsavel = r.IdResponsavel
    LEFT JOIN cuidador c ON a.IdCuidador = c.IdCuidador
    LEFT JOIN atendimento at ON a.IdAtendimento = at.IdAtendimento
    LEFT JOIN idoso i ON at.IdIdoso = i.IdIdoso
    WHERE a.IdAvaliacao = p_IdAvaliacao;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`cogitare`@`%` PROCEDURE `sp_avaliacao_buscar_por_cuidador`(
    IN p_IdCuidador INT
)
BEGIN
    SELECT 
        a.IdAvaliacao,
        a.Nota,
        a.Comentario,
        a.DataAvaliacao,
        r.Nome as NomeResponsavel,
        at.DataInicio,
        at.DataFim,
        i.Nome as NomeIdoso
    FROM avaliacao a
    LEFT JOIN responsavel r ON a.IdResponsavel = r.IdResponsavel
    LEFT JOIN atendimento at ON a.IdAtendimento = at.IdAtendimento
    LEFT JOIN idoso i ON at.IdIdoso = i.IdIdoso
    WHERE a.IdCuidador = p_IdCuidador
    ORDER BY a.DataAvaliacao DESC;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`cogitare`@`%` PROCEDURE `sp_avaliacao_buscar_por_responsavel`(
    IN p_IdResponsavel INT
)
BEGIN
    SELECT 
        a.IdAvaliacao,
        a.Nota,
        a.Comentario,
        a.DataAvaliacao,
        c.Nome as NomeCuidador,
        at.DataInicio,
        at.DataFim,
        i.Nome as NomeIdoso
    FROM avaliacao a
    LEFT JOIN cuidador c ON a.IdCuidador = c.IdCuidador
    LEFT JOIN atendimento at ON a.IdAtendimento = at.IdAtendimento
    LEFT JOIN idoso i ON at.IdIdoso = i.IdIdoso
    WHERE a.IdResponsavel = p_IdResponsavel
    ORDER BY a.DataAvaliacao DESC;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`cogitare`@`%` PROCEDURE `sp_avaliacao_calcular_media_cuidador`(
    IN p_IdCuidador INT
)
BEGIN
    SELECT 
        AVG(Nota) as MediaNota,
        COUNT(*) as TotalAvaliacoes
    FROM avaliacao 
    WHERE IdCuidador = p_IdCuidador;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`cogitare`@`%` PROCEDURE `sp_avaliacao_estatisticas`()
BEGIN
    SELECT 
        COUNT(*) as TotalAvaliacoes,
        AVG(Nota) as MediaGeral,
        MIN(Nota) as MenorNota,
        MAX(Nota) as MaiorNota,
        COUNT(CASE WHEN Nota >= 4 THEN 1 END) as AvaliacoesPositivas,
        COUNT(CASE WHEN Nota <= 2 THEN 1 END) as AvaliacoesNegativas
    FROM avaliacao;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`cogitare`@`%` PROCEDURE `sp_avaliacao_buscar_atendimentos_para_avaliacao`(
    IN p_IdResponsavel INT
)
BEGIN
    SELECT 
        a.IdAtendimento,
        a.DataInicio,
        a.DataFim,
        c.Nome as NomeCuidador,
        i.Nome as NomeIdoso,
        CASE WHEN av.IdAvaliacao IS NOT NULL THEN 1 ELSE 0 END as JaAvaliado
    FROM atendimento a
    LEFT JOIN cuidador c ON a.IdCuidador = c.IdCuidador
    LEFT JOIN idoso i ON a.IdIdoso = i.IdIdoso
    LEFT JOIN avaliacao av ON a.IdAtendimento = av.IdAtendimento
    WHERE a.IdResponsavel = p_IdResponsavel 
    AND a.Status = 'Concluído'
    AND a.DataFim <= NOW()
    ORDER BY a.DataFim DESC;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`cogitare`@`%` PROCEDURE `sp_avaliacao_verificar_existente`(
    IN p_IdAtendimento INT
)
BEGIN
    SELECT 
        CASE WHEN COUNT(*) > 0 THEN 1 ELSE 0 END as ExisteAvaliacao,
        IdAvaliacao
    FROM avaliacao 
    WHERE IdAtendimento = p_IdAtendimento
    LIMIT 1;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`cogitare`@`%` PROCEDURE `sp_avaliacao_atualizar`(
    IN p_IdAvaliacao INT,
    IN p_Nota INT,
    IN p_Comentario TEXT,
    IN p_IdAdministrador INT
)
BEGIN
    DECLARE v_NomeResponsavel VARCHAR(100);
    DECLARE v_NomeCuidador VARCHAR(100);
    DECLARE v_NotaAnterior INT;
    DECLARE v_Existe INT DEFAULT 0;
    
    -- Verificar se a avaliação existe e buscar dados
    SELECT 
        COUNT(*),
        r.Nome,
        c.Nome,
        a.Nota
    INTO 
        v_Existe,
        v_NomeResponsavel,
        v_NomeCuidador,
        v_NotaAnterior
    FROM avaliacao a
    LEFT JOIN responsavel r ON a.IdResponsavel = r.IdResponsavel
    LEFT JOIN cuidador c ON a.IdCuidador = c.IdCuidador
    WHERE a.IdAvaliacao = p_IdAvaliacao;
    
    IF v_Existe = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Avaliação não encontrada';
    END IF;
    
    -- Atualizar avaliação
    UPDATE avaliacao 
    SET Nota = p_Nota, Comentario = p_Comentario
    WHERE IdAvaliacao = p_IdAvaliacao;
    
    -- Registrar no histórico do administrador
    INSERT INTO historicoadministrador (IdAdministrador, Operacao, DataOperacao)
    VALUES (
        p_IdAdministrador,
        CONCAT('Avaliação atualizada (ID: ', p_IdAvaliacao, ') - Nota alterada de ', 
               IFNULL(v_NotaAnterior, 'N/A'), ' para ', p_Nota, 
               ' | Responsável: ', IFNULL(v_NomeResponsavel, 'N/A'), 
               ' | Cuidador: ', IFNULL(v_NomeCuidador, 'N/A')),
        NOW()
    );
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`cogitare`@`%` PROCEDURE `sp_avaliacao_excluir`(
    IN p_IdAvaliacao INT,
    IN p_IdAdministrador INT
)
BEGIN
    DECLARE v_NomeResponsavel VARCHAR(100);
    DECLARE v_NomeCuidador VARCHAR(100);
    DECLARE v_Nota INT;
    DECLARE v_Existe INT DEFAULT 0;
    
    -- Verificar se a avaliação existe e buscar dados
    SELECT 
        COUNT(*),
        r.Nome,
        c.Nome,
        a.Nota
    INTO 
        v_Existe,
        v_NomeResponsavel,
        v_NomeCuidador,
        v_Nota
    FROM avaliacao a
    LEFT JOIN responsavel r ON a.IdResponsavel = r.IdResponsavel
    LEFT JOIN cuidador c ON a.IdCuidador = c.IdCuidador
    WHERE a.IdAvaliacao = p_IdAvaliacao;
    
    IF v_Existe = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Avaliação não encontrada';
    END IF;
    
    -- Registrar no histórico do administrador ANTES de excluir
    INSERT INTO historicoadministrador (IdAdministrador, Operacao, DataOperacao)
    VALUES (
        p_IdAdministrador,
        CONCAT('Avaliação excluída (ID: ', p_IdAvaliacao, ') - Nota: ', IFNULL(v_Nota, 'N/A'), 
               ' | Responsável: ', IFNULL(v_NomeResponsavel, 'N/A'), 
               ' | Cuidador: ', IFNULL(v_NomeCuidador, 'N/A')),
        NOW()
    );
    
    -- Excluir avaliação
    DELETE FROM avaliacao WHERE IdAvaliacao = p_IdAvaliacao;
END$$
DELIMITER ;

