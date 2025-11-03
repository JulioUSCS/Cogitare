DELIMITER $$
CREATE DEFINER=`cogitare`@`%` PROCEDURE `sp_idoso_criar`(
    IN p_IdResponsavel INT,
    IN p_IdMobilidade INT,
    IN p_IdNivelAutonomia INT,
    IN p_Nome VARCHAR(100),
    IN p_DataNascimento DATE,
    IN p_Sexo VARCHAR(20),
    IN p_CuidadosMedicos TEXT,
    IN p_DescricaoExtra TEXT,
    IN p_FotoUrl VARCHAR(255),
    IN p_IdAdministrador INT
)
BEGIN
    DECLARE v_IdIdoso INT;
    
    -- Inserir idoso
    INSERT INTO idoso (
        IdResponsavel, IdMobilidade, IdNivelAutonomia, Nome, DataNascimento, 
        Sexo, CuidadosMedicos, DescricaoExtra, FotoUrl
    )
    VALUES (
        p_IdResponsavel, p_IdMobilidade, p_IdNivelAutonomia, p_Nome, p_DataNascimento,
        p_Sexo, p_CuidadosMedicos, p_DescricaoExtra, p_FotoUrl
    );
    
    SET v_IdIdoso = LAST_INSERT_ID();
    
    -- Registrar no histórico do administrador
    INSERT INTO historicoadministrador (IdAdministrador, Operacao, DataOperacao)
    VALUES (
        p_IdAdministrador,
        CONCAT('Idoso criado (ID: ', v_IdIdoso, ') - Nome: ', p_Nome, 
               ' | Responsável: ', IFNULL(p_IdResponsavel, 'N/A'), 
               ' | Sexo: ', IFNULL(p_Sexo, 'N/A')),
        NOW()
    );
    
    SELECT v_IdIdoso AS Id;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`cogitare`@`%` PROCEDURE `sp_idoso_listar`()
BEGIN
    SELECT * FROM idoso
    ORDER BY Nome;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`cogitare`@`%` PROCEDURE `sp_idoso_buscar_por_id`(
    IN p_IdIdoso INT
)
BEGIN
    SELECT * FROM idoso
    WHERE IdIdoso = p_IdIdoso;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`cogitare`@`%` PROCEDURE `sp_idoso_atualizar`(
    IN p_IdIdoso INT,
    IN p_IdResponsavel INT,
    IN p_IdMobilidade INT,
    IN p_IdNivelAutonomia INT,
    IN p_Nome VARCHAR(100),
    IN p_DataNascimento DATE,
    IN p_Sexo VARCHAR(20),
    IN p_CuidadosMedicos TEXT,
    IN p_DescricaoExtra TEXT,
    IN p_FotoUrl VARCHAR(255),
    IN p_IdAdministrador INT
)
BEGIN
    DECLARE v_NomeAnterior VARCHAR(100);
    DECLARE v_Existe INT DEFAULT 0;
    
    -- Verificar se o idoso existe e buscar nome anterior
    SELECT COUNT(*), Nome
    INTO v_Existe, v_NomeAnterior
    FROM idoso
    WHERE IdIdoso = p_IdIdoso;
    
    IF v_Existe = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Idoso não encontrado';
    END IF;
    
    -- Atualizar idoso
    UPDATE idoso 
    SET 
        IdResponsavel = p_IdResponsavel,
        IdMobilidade = p_IdMobilidade,
        IdNivelAutonomia = p_IdNivelAutonomia,
        Nome = p_Nome,
        DataNascimento = p_DataNascimento,
        Sexo = p_Sexo,
        CuidadosMedicos = p_CuidadosMedicos,
        DescricaoExtra = p_DescricaoExtra,
        FotoUrl = p_FotoUrl
    WHERE IdIdoso = p_IdIdoso;
    
    -- Registrar no histórico do administrador
    INSERT INTO historicoadministrador (IdAdministrador, Operacao, DataOperacao)
    VALUES (
        p_IdAdministrador,
        CONCAT('Idoso atualizado (ID: ', p_IdIdoso, ') - Nome: ', IFNULL(v_NomeAnterior, 'N/A'), 
               ' para ', p_Nome, 
               ' | Responsável: ', IFNULL(p_IdResponsavel, 'N/A'), 
               ' | Sexo: ', IFNULL(p_Sexo, 'N/A')),
        NOW()
    );
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`cogitare`@`%` PROCEDURE `sp_idoso_excluir`(
    IN p_IdIdoso INT,
    IN p_IdAdministrador INT
)
BEGIN
    DECLARE v_Nome VARCHAR(100);
    DECLARE v_NomeResponsavel VARCHAR(100);
    DECLARE v_Existe INT DEFAULT 0;
    
    -- Verificar se o idoso existe e buscar dados
    SELECT 
        COUNT(*), 
        i.Nome,
        r.Nome
    INTO 
        v_Existe, 
        v_Nome,
        v_NomeResponsavel
    FROM idoso i
    LEFT JOIN responsavel r ON i.IdResponsavel = r.IdResponsavel
    WHERE i.IdIdoso = p_IdIdoso;
    
    IF v_Existe = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Idoso não encontrado';
    END IF;
    
    -- Registrar no histórico do administrador ANTES de excluir
    INSERT INTO historicoadministrador (IdAdministrador, Operacao, DataOperacao)
    VALUES (
        p_IdAdministrador,
        CONCAT('Idoso excluído (ID: ', p_IdIdoso, ') - Nome: ', IFNULL(v_Nome, 'N/A'), 
               ' | Responsável: ', IFNULL(v_NomeResponsavel, 'N/A')),
        NOW()
    );
    
    -- Excluir doenças e restrições alimentares do idoso
    DELETE FROM idosodoenca WHERE IdIdoso = p_IdIdoso;
    DELETE FROM idosorestricaoalimentar WHERE IdIdoso = p_IdIdoso;
    
    -- Excluir atendimentos (isso causará CASCADE para avaliações, pagamentos, receitas, histórico)
    DELETE FROM atendimento WHERE IdIdoso = p_IdIdoso;
    
    -- Finalmente, excluir o idoso
    DELETE FROM idoso WHERE IdIdoso = p_IdIdoso;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`cogitare`@`%` PROCEDURE `sp_idoso_listar_responsaveis`()
BEGIN
    SELECT IdResponsavel, Nome FROM responsavel ORDER BY Nome;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`cogitare`@`%` PROCEDURE `sp_idoso_listar_mobilidades`()
BEGIN
    SELECT * FROM mobilidade ORDER BY Descricao;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`cogitare`@`%` PROCEDURE `sp_idoso_listar_niveis_autonomia`()
BEGIN
    SELECT * FROM nivelautonomia ORDER BY Descricao;
END$$
DELIMITER ;

