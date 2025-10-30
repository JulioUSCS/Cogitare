DELIMITER $$
CREATE DEFINER=`cogitare`@`%` PROCEDURE `sp_buscar_admin_por_usuario`(
    IN p_Usuario VARCHAR(100)
)
BEGIN
    SELECT 
        a.IdAdministrador,
        a.Usuario,
        a.Senha,           -- hash (bcrypt)
        a.Tipo,
        a.Nome,
        a.Email,
        a.Ativo,
        a.UltimoAcesso
    FROM administrador a
    WHERE a.Usuario = p_Usuario
      AND a.Ativo = 1
    LIMIT 1;
END$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`cogitare`@`%` PROCEDURE `sp_registrar_login_admin`(
    IN p_IdAdministrador INT
)
BEGIN
    UPDATE administrador
    SET UltimoAcesso = NOW()
    WHERE IdAdministrador = p_IdAdministrador;

    INSERT INTO historicoadministrador (IdAdministrador, Operacao, DataOperacao)
    VALUES (p_IdAdministrador, 'Login', NOW());
END$$
DELIMITER ;
