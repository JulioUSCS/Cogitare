
DELIMITER $$
CREATE DEFINER=`cogitare`@`%` PROCEDURE `sp_responsavel_atualizar`(
    IN p_IdResponsavel INT,
    IN p_IdEndereco INT,
    IN p_Cpf VARCHAR(20),
    IN p_Nome VARCHAR(100),
    IN p_Email VARCHAR(100),
    IN p_Telefone VARCHAR(20),
    IN p_DataNascimento DATE,
    IN p_FotoUrl VARCHAR(255),
    IN p_IdAdministrador INT
)
BEGIN
    DECLARE v_NomeAnterior VARCHAR(100);
    DECLARE v_Existe INT DEFAULT 0;
    
    -- Verificar se o responsável existe e buscar nome anterior
    SELECT COUNT(*), Nome
    INTO v_Existe, v_NomeAnterior
    FROM responsavel
    WHERE IdResponsavel = p_IdResponsavel;
    
    IF v_Existe = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Responsável não encontrado';
    END IF;
    
    UPDATE responsavel
    SET 
        IdEndereco = p_IdEndereco,
        Cpf = p_Cpf,
        Nome = p_Nome,
        Email = p_Email,
        Telefone = p_Telefone,
        DataNascimento = p_DataNascimento,
        FotoUrl = p_FotoUrl
    WHERE IdResponsavel = p_IdResponsavel;
    
    -- Registrar no histórico do administrador
    INSERT INTO historicoadministrador (IdAdministrador, Operacao, DataOperacao)
    VALUES (
        p_IdAdministrador,
        CONCAT('Responsável atualizado (ID: ', p_IdResponsavel, ') - Nome: ', IFNULL(v_NomeAnterior, 'N/A'), 
               ' para ', p_Nome, 
               ' | Email: ', IFNULL(p_Email, 'N/A'), ' | Telefone: ', IFNULL(p_Telefone, 'N/A')),
        NOW()
    );
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`cogitare`@`%` PROCEDURE `sp_responsavel_criar`(
    IN p_IdEndereco INT,
    IN p_Cpf VARCHAR(20),
    IN p_Nome VARCHAR(100),
    IN p_Email VARCHAR(100),
    IN p_Telefone VARCHAR(20),
    IN p_DataNascimento DATE,
    IN p_FotoUrl VARCHAR(255),
    IN p_IdAdministrador INT
)
BEGIN
    DECLARE v_IdResponsavel INT;
    
    INSERT INTO responsavel (IdEndereco, Cpf, Nome, Email, Telefone, DataNascimento, FotoUrl)
    VALUES (p_IdEndereco, p_Cpf, p_Nome, p_Email, p_Telefone, p_DataNascimento, p_FotoUrl);

    SET v_IdResponsavel = LAST_INSERT_ID();
    
    -- Registrar no histórico do administrador
    INSERT INTO historicoadministrador (IdAdministrador, Operacao, DataOperacao)
    VALUES (
        p_IdAdministrador,
        CONCAT('Responsável criado (ID: ', v_IdResponsavel, ') - Nome: ', p_Nome, 
               ' | Email: ', IFNULL(p_Email, 'N/A'), ' | CPF: ', IFNULL(p_Cpf, 'N/A')),
        NOW()
    );

    SELECT v_IdResponsavel AS Id;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`cogitare`@`%` PROCEDURE `sp_responsavel_excluir`(
    IN p_IdResponsavel INT,
    IN p_IdAdministrador INT
)
BEGIN
    DECLARE v_Nome VARCHAR(100);
    DECLARE v_Email VARCHAR(100);
    DECLARE v_Existe INT DEFAULT 0;
    
    -- Verificar se o responsável existe e buscar dados
    SELECT COUNT(*), Nome, Email
    INTO v_Existe, v_Nome, v_Email
    FROM responsavel
    WHERE IdResponsavel = p_IdResponsavel;
    
    IF v_Existe = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Responsável não encontrado';
    END IF;
    
    -- Registrar no histórico do administrador ANTES de excluir
    INSERT INTO historicoadministrador (IdAdministrador, Operacao, DataOperacao)
    VALUES (
        p_IdAdministrador,
        CONCAT('Responsável excluído (ID: ', p_IdResponsavel, ') - Nome: ', IFNULL(v_Nome, 'N/A'), 
               ' | Email: ', IFNULL(v_Email, 'N/A')),
        NOW()
    );
    
    DELETE FROM responsavel WHERE IdResponsavel = p_IdResponsavel;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`cogitare`@`%` PROCEDURE `sp_responsavel_listar`()
BEGIN
    SELECT 
        IdResponsavel, IdEndereco, Cpf, Nome, Email, Telefone, DataNascimento, FotoUrl 
    FROM responsavel
    ORDER BY Nome;
END$$
DELIMITER ;
