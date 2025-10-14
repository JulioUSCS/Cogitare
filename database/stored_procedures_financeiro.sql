-- ========================================
-- STORED PROCEDURES - SISTEMA FINANCEIRO
-- ========================================
-- Sistema: Cogitare
-- Módulo: Financeiro
-- Data: 2025-10-14
-- ========================================

USE cogitare_bd;

DELIMITER $$

-- ========================================
-- 1. RECEITAS
-- ========================================

-- SP para criar nova receita
DROP PROCEDURE IF EXISTS sp_criar_receita$$
CREATE PROCEDURE sp_criar_receita(
    IN p_IdAtendimento INT,
    IN p_IdResponsavel INT,
    IN p_Valor DECIMAL(10,2),
    IN p_FormaPagamento VARCHAR(50),
    IN p_Observacoes TEXT,
    OUT p_IdReceita INT,
    OUT p_Mensagem VARCHAR(255),
    OUT p_Sucesso BOOLEAN
)
BEGIN
    DECLARE v_StatusAtendimento VARCHAR(50);
    DECLARE v_ReceitaExistente INT;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        SET p_Sucesso = FALSE;
        SET p_Mensagem = 'Erro ao criar receita';
        ROLLBACK;
    END;
    
    START TRANSACTION;
    
    -- Verificar se a receita está vinculada a um atendimento
    IF p_IdAtendimento IS NOT NULL THEN
        -- Buscar status do atendimento
        SELECT Status INTO v_StatusAtendimento
        FROM atendimento
        WHERE IdAtendimento = p_IdAtendimento;
        
        -- Verificar se atendimento existe
        IF v_StatusAtendimento IS NULL THEN
            SET p_Sucesso = FALSE;
            SET p_Mensagem = 'Atendimento não encontrado';
            ROLLBACK;
        ELSE
            -- Verificar se atendimento está concluído
            IF v_StatusAtendimento != 'Concluído' THEN
                SET p_Sucesso = FALSE;
                SET p_Mensagem = CONCAT('Não é possível criar receita para atendimento com status "', v_StatusAtendimento, '". Apenas atendimentos "Concluído" podem ter receitas.');
                ROLLBACK;
            ELSE
                -- Verificar se já existe receita para este atendimento
                SELECT COUNT(*) INTO v_ReceitaExistente
                FROM receita
                WHERE IdAtendimento = p_IdAtendimento;
                
                IF v_ReceitaExistente > 0 THEN
                    SET p_Sucesso = FALSE;
                    SET p_Mensagem = 'Já existe uma receita para este atendimento';
                    ROLLBACK;
                ELSE
                    -- Inserir receita
                    INSERT INTO receita (IdAtendimento, IdResponsavel, Valor, FormaPagamento, Observacoes)
                    VALUES (p_IdAtendimento, p_IdResponsavel, p_Valor, p_FormaPagamento, p_Observacoes);
                    
                    SET p_IdReceita = LAST_INSERT_ID();
                    SET p_Sucesso = TRUE;
                    SET p_Mensagem = 'Receita criada com sucesso';
                    COMMIT;
                END IF;
            END IF;
        END IF;
    ELSE
        -- Inserir receita sem atendimento
        INSERT INTO receita (IdAtendimento, IdResponsavel, Valor, FormaPagamento, Observacoes)
        VALUES (p_IdAtendimento, p_IdResponsavel, p_Valor, p_FormaPagamento, p_Observacoes);
        
        SET p_IdReceita = LAST_INSERT_ID();
        SET p_Sucesso = TRUE;
        SET p_Mensagem = 'Receita criada com sucesso';
        COMMIT;
    END IF;
END$$

-- SP para buscar receitas por período
DROP PROCEDURE IF EXISTS sp_buscar_receitas_periodo$$
CREATE PROCEDURE sp_buscar_receitas_periodo(
    IN p_DataInicio DATE,
    IN p_DataFim DATE
)
BEGIN
    SELECT 
        r.IdReceita,
        r.Valor,
        r.DataRecebimento,
        r.FormaPagamento,
        r.Status,
        r.Observacoes,
        resp.Nome as NomeResponsavel,
        a.ObservacaoExtra as DescricaoAtendimento,
        a.Local,
        a.DataInicio
    FROM receita r
    LEFT JOIN responsavel resp ON r.IdResponsavel = resp.IdResponsavel
    LEFT JOIN atendimento a ON r.IdAtendimento = a.IdAtendimento
    WHERE DATE(r.DataRecebimento) BETWEEN p_DataInicio AND p_DataFim
    ORDER BY r.DataRecebimento DESC;
END$$

-- ========================================
-- 2. DESPESAS
-- ========================================

-- SP para criar nova despesa
DROP PROCEDURE IF EXISTS sp_criar_despesa$$
CREATE PROCEDURE sp_criar_despesa(
    IN p_TipoDespesa VARCHAR(100),
    IN p_Categoria VARCHAR(100),
    IN p_Descricao TEXT,
    IN p_Valor DECIMAL(10,2),
    IN p_IdCuidador INT,
    IN p_Comprovante VARCHAR(255),
    IN p_Observacoes TEXT,
    OUT p_IdDespesa INT,
    OUT p_Mensagem VARCHAR(255),
    OUT p_Sucesso BOOLEAN
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        SET p_Sucesso = FALSE;
        SET p_Mensagem = 'Erro ao criar despesa';
        ROLLBACK;
    END;
    
    START TRANSACTION;
    
    INSERT INTO despesa (TipoDespesa, Categoria, Descricao, Valor, IdCuidador, Comprovante, Observacoes)
    VALUES (p_TipoDespesa, p_Categoria, p_Descricao, p_Valor, p_IdCuidador, p_Comprovante, p_Observacoes);
    
    SET p_IdDespesa = LAST_INSERT_ID();
    SET p_Sucesso = TRUE;
    SET p_Mensagem = 'Despesa criada com sucesso';
    
    COMMIT;
END$$

-- SP para buscar despesas por período
DROP PROCEDURE IF EXISTS sp_buscar_despesas_periodo$$
CREATE PROCEDURE sp_buscar_despesas_periodo(
    IN p_DataInicio DATE,
    IN p_DataFim DATE
)
BEGIN
    SELECT 
        d.IdDespesa,
        d.TipoDespesa,
        d.Categoria,
        d.Descricao,
        d.Valor,
        d.DataDespesa,
        d.Status,
        d.Comprovante,
        c.Nome as NomeCuidador
    FROM despesa d
    LEFT JOIN cuidador c ON d.IdCuidador = c.IdCuidador
    WHERE DATE(d.DataDespesa) BETWEEN p_DataInicio AND p_DataFim
    ORDER BY d.DataDespesa DESC;
END$$

-- SP para buscar despesas por categoria
DROP PROCEDURE IF EXISTS sp_buscar_despesas_categoria$$
CREATE PROCEDURE sp_buscar_despesas_categoria(
    IN p_DataInicio DATE,
    IN p_DataFim DATE
)
BEGIN
    SELECT 
        Categoria,
        SUM(Valor) as TotalDespesas,
        COUNT(*) as QtdDespesas
    FROM despesa 
    WHERE DATE(DataDespesa) BETWEEN p_DataInicio AND p_DataFim
    AND Status = 'Pago'
    GROUP BY Categoria
    ORDER BY TotalDespesas DESC;
END$$

-- ========================================
-- 3. COMISSÕES
-- ========================================

-- SP para calcular comissão
DROP PROCEDURE IF EXISTS sp_calcular_comissao$$
CREATE PROCEDURE sp_calcular_comissao(
    IN p_IdAtendimento INT,
    IN p_IdCuidador INT,
    OUT p_IdComissao INT,
    OUT p_ValorComissao DECIMAL(10,2),
    OUT p_Mensagem VARCHAR(255),
    OUT p_Sucesso BOOLEAN
)
BEGIN
    DECLARE v_ValorAtendimento DECIMAL(10,2);
    DECLARE v_PercentualComissao DECIMAL(5,2);
    DECLARE v_ComissaoExistente INT;
    
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        SET p_Sucesso = FALSE;
        SET p_Mensagem = 'Erro ao calcular comissão';
        ROLLBACK;
    END;
    
    START TRANSACTION;
    
    -- Buscar valor do atendimento
    SELECT a.Valor INTO v_ValorAtendimento
    FROM atendimento a
    WHERE a.IdAtendimento = p_IdAtendimento AND a.IdCuidador = p_IdCuidador;
    
    IF v_ValorAtendimento IS NULL THEN
        SET p_Sucesso = FALSE;
        SET p_Mensagem = 'Atendimento não encontrado';
        ROLLBACK;
    ELSE
        -- Buscar percentual de comissão (padrão 70%)
        SELECT COALESCE(Valor, 70.00) INTO v_PercentualComissao
        FROM configuracaofinanceira
        WHERE Chave = 'percentual_comissao_padrao'
        LIMIT 1;
        
        SET p_ValorComissao = (v_ValorAtendimento * v_PercentualComissao) / 100;
        
        -- Verificar se já existe comissão
        SELECT COUNT(*) INTO v_ComissaoExistente
        FROM comissao
        WHERE IdAtendimento = p_IdAtendimento;
        
        IF v_ComissaoExistente > 0 THEN
            SET p_Sucesso = FALSE;
            SET p_Mensagem = 'Comissão já calculada para este atendimento';
            ROLLBACK;
        ELSE
            -- Inserir comissão
            INSERT INTO comissao (IdCuidador, IdAtendimento, ValorBase, PercentualComissao, ValorComissao, ValorTotal)
            VALUES (p_IdCuidador, p_IdAtendimento, v_ValorAtendimento, v_PercentualComissao, p_ValorComissao, p_ValorComissao);
            
            SET p_IdComissao = LAST_INSERT_ID();
            SET p_Sucesso = TRUE;
            SET p_Mensagem = 'Comissão calculada com sucesso';
            COMMIT;
        END IF;
    END IF;
END$$

-- SP para buscar comissões por período
DROP PROCEDURE IF EXISTS sp_buscar_comissoes_periodo$$
CREATE PROCEDURE sp_buscar_comissoes_periodo(
    IN p_DataInicio DATE,
    IN p_DataFim DATE
)
BEGIN
    SELECT 
        c.IdComissao,
        c.ValorBase,
        c.PercentualComissao,
        c.ValorComissao,
        c.Bonificacao,
        c.ValorTotal,
        c.DataCalculo,
        c.DataPagamento,
        c.Status,
        cu.Nome as NomeCuidador,
        a.ObservacaoExtra as DescricaoAtendimento,
        a.Local,
        a.DataInicio
    FROM comissao c
    LEFT JOIN cuidador cu ON c.IdCuidador = cu.IdCuidador
    LEFT JOIN atendimento a ON c.IdAtendimento = a.IdAtendimento
    WHERE DATE(c.DataCalculo) BETWEEN p_DataInicio AND p_DataFim
    ORDER BY c.DataCalculo DESC;
END$$

-- ========================================
-- 4. INADIMPLÊNCIA
-- ========================================

-- SP para verificar inadimplência
DROP PROCEDURE IF EXISTS sp_verificar_inadimplencia$$
CREATE PROCEDURE sp_verificar_inadimplencia()
BEGIN
    SELECT 
        a.IdAtendimento,
        a.IdResponsavel,
        a.Valor,
        a.DataInicio,
        r.Nome as NomeResponsavel,
        r.Email,
        r.Telefone,
        DATEDIFF(CURDATE(), a.DataInicio) as DiasAtraso
    FROM atendimento a
    LEFT JOIN responsavel r ON a.IdResponsavel = r.IdResponsavel
    WHERE a.Status = 'Concluído' 
    AND a.Valor > 0
    AND DATEDIFF(CURDATE(), a.DataInicio) > 5
    AND NOT EXISTS (
        SELECT 1 FROM receita rec 
        WHERE rec.IdAtendimento = a.IdAtendimento 
        AND rec.Status = 'Pago'
    )
    AND NOT EXISTS (
        SELECT 1 FROM inadimplencia i 
        WHERE i.IdAtendimento = a.IdAtendimento
    );
END$$

-- SP para buscar inadimplência por período
DROP PROCEDURE IF EXISTS sp_buscar_inadimplencia_periodo$$
CREATE PROCEDURE sp_buscar_inadimplencia_periodo(
    IN p_DataInicio DATE,
    IN p_DataFim DATE
)
BEGIN
    SELECT 
        i.IdInadimplencia,
        i.ValorDevido,
        i.DataVencimento,
        i.DiasAtraso,
        i.Status,
        i.TentativasCobranca,
        i.UltimaTentativa,
        r.Nome as NomeResponsavel,
        r.Email,
        r.Telefone,
        a.ObservacaoExtra as DescricaoAtendimento,
        a.Local,
        a.DataInicio,
        a.Status as StatusAtendimento
    FROM inadimplencia i
    LEFT JOIN responsavel r ON i.IdResponsavel = r.IdResponsavel
    LEFT JOIN atendimento a ON i.IdAtendimento = a.IdAtendimento
    WHERE DATE(i.DataVencimento) BETWEEN p_DataInicio AND p_DataFim
    ORDER BY i.DiasAtraso DESC;
END$$

-- ========================================
-- 5. ESTATÍSTICAS FINANCEIRAS
-- ========================================

-- SP para buscar estatísticas financeiras completas
DROP PROCEDURE IF EXISTS sp_buscar_estatisticas_financeiras$$
CREATE PROCEDURE sp_buscar_estatisticas_financeiras(
    IN p_DataInicio DATE,
    IN p_DataFim DATE
)
BEGIN
    SELECT 
        -- ========== MÉTRICAS DE VENDAS ==========
        -- Total de vendas (todos os atendimentos)
        (SELECT COALESCE(SUM(Valor), 0) FROM atendimento) as TotalVendas,
        
        -- Valor a receber (atendimentos não concluídos)
        (SELECT COALESCE(SUM(Valor), 0) FROM atendimento 
         WHERE Status != 'Concluído') as ValorAReceber,
        
        -- Valor já recebido (atendimentos concluídos)
        (SELECT COALESCE(SUM(Valor), 0) FROM atendimento 
         WHERE Status = 'Concluído') as ValorRecebido,
        
        -- ========== MÉTRICAS DE REPASSE ==========
        -- Repasse aos cuidadores (90% do total de vendas)
        (SELECT COALESCE(SUM(Valor), 0) * 0.90 FROM atendimento) as RepasseCuidador,
        
        -- Receita da plataforma (10% do total de vendas)
        (SELECT COALESCE(SUM(Valor), 0) * 0.10 FROM atendimento) as ReceitaPlataforma,
        
        -- ========== MÉTRICAS DE RECEITA ==========
        -- Receita total de todos os atendimentos concluídos
        (SELECT COALESCE(SUM(Valor), 0) FROM atendimento 
         WHERE Status = 'Concluído') as ReceitaAtendimentosConcluidos,
        
        -- Receitas efetivamente recebidas (tabela receita)
        (SELECT COALESCE(SUM(Valor), 0) FROM receita 
         WHERE Status = 'Pago') as ReceitaTotalEfetiva,
        
        -- ========== MÉTRICAS DE DESPESAS ==========
        -- Despesas do período
        (SELECT COALESCE(SUM(Valor), 0) FROM despesa 
         WHERE DATE(DataDespesa) BETWEEN p_DataInicio AND p_DataFim AND Status = 'Pago') as TotalDespesas,
        
        -- Comissões baseadas em atendimentos concluídos
        (SELECT COALESCE(SUM(com.ValorTotal), 0) FROM comissao com
         INNER JOIN atendimento at ON com.IdAtendimento = at.IdAtendimento
         WHERE at.Status = 'Concluído' AND com.Status = 'Pago') as TotalComissoes,
        
        -- Inadimplência (atendimentos sem pagamento)
        (SELECT COALESCE(SUM(at.Valor), 0) FROM atendimento at
         LEFT JOIN pagamento p ON at.IdAtendimento = p.IdAtendimento
         WHERE at.Status = 'Concluído' 
         AND (p.IdPagamento IS NULL OR p.StatusPagamento != 'Pago')) as TotalInadimplencia,
        
        -- ========== QUANTIDADES ==========
        -- Quantidades de atendimentos por status
        (SELECT COUNT(*) FROM atendimento 
         WHERE Status = 'Concluído') as QtdAtendimentosConcluidos,
        
        (SELECT COUNT(*) FROM atendimento 
         WHERE Status != 'Concluído') as QtdAtendimentosPendentes,
        
        (SELECT COUNT(*) FROM atendimento) as QtdTotalAtendimentos,
        
        (SELECT COUNT(*) FROM receita 
         WHERE Status = 'Pago') as QtdReceitasEfetivas,
        
        (SELECT COUNT(*) FROM despesa 
         WHERE DATE(DataDespesa) BETWEEN p_DataInicio AND p_DataFim AND Status = 'Pago') as QtdDespesas,
        
        (SELECT COUNT(*) FROM atendimento at
         LEFT JOIN pagamento p ON at.IdAtendimento = p.IdAtendimento
         WHERE at.Status = 'Concluído' 
         AND (p.IdPagamento IS NULL OR p.StatusPagamento != 'Pago')) as QtdInadimplencia;
END$$

-- SP para buscar receitas por mês (últimos 12 meses)
DROP PROCEDURE IF EXISTS sp_buscar_receitas_mes$$
CREATE PROCEDURE sp_buscar_receitas_mes()
BEGIN
    SELECT 
        DATE_FORMAT(DataInicio, '%Y-%m') as Mes,
        SUM(Valor) as TotalReceitas,
        COUNT(*) as QtdReceitas
    FROM atendimento 
    WHERE DataInicio >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
    AND Status = 'Concluído'
    GROUP BY DATE_FORMAT(DataInicio, '%Y-%m')
    ORDER BY Mes ASC;
END$$

-- SP para buscar cuidadores mais rentáveis
DROP PROCEDURE IF EXISTS sp_buscar_cuidadores_rentaveis$$
CREATE PROCEDURE sp_buscar_cuidadores_rentaveis(
    IN p_DataInicio DATE,
    IN p_DataFim DATE
)
BEGIN
    SELECT 
        c.IdCuidador,
        c.Nome,
        COUNT(a.IdAtendimento) as QtdAtendimentos,
        COALESCE(SUM(a.Valor), 0) as TotalReceitas,
        COALESCE(AVG(a.Valor), 0) as MediaAtendimento,
        COALESCE(SUM(com.ValorTotal), 0) as TotalComissoes
    FROM cuidador c
    LEFT JOIN atendimento a ON c.IdCuidador = a.IdCuidador 
        AND DATE(a.DataInicio) BETWEEN p_DataInicio AND p_DataFim
        AND a.Status = 'Concluído'
    LEFT JOIN comissao com ON a.IdAtendimento = com.IdAtendimento
    GROUP BY c.IdCuidador, c.Nome
    ORDER BY TotalReceitas DESC
    LIMIT 10;
END$$

-- ========================================
-- 6. RECEITA AUTOMÁTICA
-- ========================================

-- SP para criar receita automática
DROP PROCEDURE IF EXISTS sp_criar_receita_automatica$$
CREATE PROCEDURE sp_criar_receita_automatica(
    IN p_IdAtendimento INT,
    OUT p_IdReceita INT,
    OUT p_Mensagem VARCHAR(255),
    OUT p_Sucesso BOOLEAN
)
BEGIN
    DECLARE v_IdResponsavel INT;
    DECLARE v_Valor DECIMAL(10,2);
    DECLARE v_Status VARCHAR(50);
    DECLARE v_ReceitaExistente INT;
    
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        SET p_Sucesso = FALSE;
        SET p_Mensagem = 'Erro ao criar receita automática';
        ROLLBACK;
    END;
    
    START TRANSACTION;
    
    -- Buscar dados do atendimento
    SELECT IdResponsavel, Valor, Status
    INTO v_IdResponsavel, v_Valor, v_Status
    FROM atendimento
    WHERE IdAtendimento = p_IdAtendimento;
    
    -- Verificar se atendimento existe
    IF v_IdResponsavel IS NULL THEN
        SET p_Sucesso = FALSE;
        SET p_Mensagem = 'Atendimento não encontrado';
        ROLLBACK;
    ELSE
        -- Verificar se está concluído
        IF v_Status != 'Concluído' THEN
            SET p_Sucesso = FALSE;
            SET p_Mensagem = CONCAT('Não é possível criar receita para atendimento com status "', v_Status, '"');
            ROLLBACK;
        ELSE
            -- Verificar se já existe receita
            SELECT COUNT(*) INTO v_ReceitaExistente
            FROM receita
            WHERE IdAtendimento = p_IdAtendimento;
            
            IF v_ReceitaExistente > 0 THEN
                SET p_Sucesso = FALSE;
                SET p_Mensagem = 'Receita já existe para este atendimento';
                ROLLBACK;
            ELSE
                -- Verificar valor válido
                IF v_Valor IS NULL OR v_Valor <= 0 THEN
                    SET p_Sucesso = FALSE;
                    SET p_Mensagem = 'Valor do atendimento inválido';
                    ROLLBACK;
                ELSE
                    -- Criar receita
                    INSERT INTO receita (IdAtendimento, IdResponsavel, Valor, Status, FormaPagamento, Observacoes, DataRecebimento)
                    VALUES (p_IdAtendimento, v_IdResponsavel, v_Valor, 'Pago', 'Automático', 'Receita gerada automaticamente pelo sistema', NOW());
                    
                    SET p_IdReceita = LAST_INSERT_ID();
                    SET p_Sucesso = TRUE;
                    SET p_Mensagem = 'Receita criada automaticamente com sucesso';
                    COMMIT;
                END IF;
            END IF;
        END IF;
    END IF;
END$$

-- ========================================
-- 7. METAS FINANCEIRAS
-- ========================================

-- SP para buscar metas financeiras
DROP PROCEDURE IF EXISTS sp_buscar_metas_financeiras$$
CREATE PROCEDURE sp_buscar_metas_financeiras()
BEGIN
    SELECT 
        IdMeta,
        TipoMeta,
        Descricao,
        ValorMeta,
        ValorAtual,
        DataInicio,
        DataFim,
        Status,
        ROUND((ValorAtual / ValorMeta) * 100, 2) as PercentualAlcancado
    FROM metafinanceira
    WHERE Status = 'Ativa'
    ORDER BY DataFim ASC;
END$$

-- SP para atualizar progresso das metas
DROP PROCEDURE IF EXISTS sp_atualizar_progresso_metas$$
CREATE PROCEDURE sp_atualizar_progresso_metas(
    OUT p_Mensagem VARCHAR(255),
    OUT p_Sucesso BOOLEAN
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        SET p_Sucesso = FALSE;
        SET p_Mensagem = 'Erro ao atualizar progresso das metas';
        ROLLBACK;
    END;
    
    START TRANSACTION;
    
    -- Atualizar meta de receita mensal
    UPDATE metafinanceira 
    SET ValorAtual = (
        SELECT COALESCE(SUM(Valor), 0) 
        FROM receita 
        WHERE DATE(DataRecebimento) >= DATE_FORMAT(CURDATE(), '%Y-%m-01')
        AND DATE(DataRecebimento) <= LAST_DAY(CURDATE())
        AND Status = 'Pago'
    )
    WHERE TipoMeta = 'Receita' AND Status = 'Ativa';
    
    -- Atualizar meta de lucro mensal
    UPDATE metafinanceira 
    SET ValorAtual = (
        SELECT COALESCE(SUM(Valor), 0) 
        FROM receita 
        WHERE DATE(DataRecebimento) >= DATE_FORMAT(CURDATE(), '%Y-%m-01')
        AND DATE(DataRecebimento) <= LAST_DAY(CURDATE())
        AND Status = 'Pago'
    ) - (
        SELECT COALESCE(SUM(Valor), 0) 
        FROM despesa 
        WHERE DATE(DataDespesa) >= DATE_FORMAT(CURDATE(), '%Y-%m-01')
        AND DATE(DataDespesa) <= LAST_DAY(CURDATE())
        AND Status = 'Pago'
    )
    WHERE TipoMeta = 'Lucro' AND Status = 'Ativa';
    
    SET p_Sucesso = TRUE;
    SET p_Mensagem = 'Progresso das metas atualizado com sucesso';
    COMMIT;
END$$

DELIMITER ;

-- ========================================
-- FIM DAS STORED PROCEDURES
-- ========================================

-- Exibir mensagem de sucesso
SELECT 'Stored Procedures criadas com sucesso!' as Status;

