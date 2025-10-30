DELIMITER $$
CREATE DEFINER=`cogitare`@`%` PROCEDURE `sp_responsavel_atualizar`(
    IN p_IdResponsavel INT,
    IN p_IdEndereco INT,
    IN p_Cpf VARCHAR(20),
    IN p_Nome VARCHAR(100),
    IN p_Email VARCHAR(100),
    IN p_Telefone VARCHAR(20),
    IN p_DataNascimento DATE,
    IN p_FotoUrl VARCHAR(255)
)
BEGIN
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
    IN p_FotoUrl VARCHAR(255)
)
BEGIN
    INSERT INTO responsavel (IdEndereco, Cpf, Nome, Email, Telefone, DataNascimento, FotoUrl)
    VALUES (p_IdEndereco, p_Cpf, p_Nome, p_Email, p_Telefone, p_DataNascimento, p_FotoUrl);

    SELECT LAST_INSERT_ID() AS Id;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`cogitare`@`%` PROCEDURE `sp_responsavel_excluir`(
    IN p_IdResponsavel INT
)
BEGIN
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
