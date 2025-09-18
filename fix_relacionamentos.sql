-- =====================================================
-- SCRIPT PARA CORRIGIR RELACIONAMENTOS QUEBRADOS
-- Sistema Cogitare - Correção de Inconsistências
-- =====================================================

-- 1. CORRIGIR RESPONSÁVEIS DUPLICADOS
-- =====================================================

-- Primeiro, vamos verificar os dados atuais
SELECT 'ANTES - Responsáveis duplicados:' as Status;
SELECT IdResponsavel, Nome, Cpf, Email FROM responsavel WHERE Nome = 'Maria Silva';

-- Atualizar atendimentos para usar o responsável correto (ID 4)
UPDATE atendimento 
SET IdResponsavel = 4 
WHERE IdResponsavel = 1;

-- Atualizar idosos para usar o responsável correto (ID 4)
UPDATE idoso 
SET IdResponsavel = 4 
WHERE IdResponsavel = 1;

-- Remover o responsável duplicado (ID 1)
DELETE FROM responsavel WHERE IdResponsavel = 1;

-- Verificar resultado
SELECT 'DEPOIS - Responsáveis únicos:' as Status;
SELECT IdResponsavel, Nome, Cpf, Email FROM responsavel WHERE Nome = 'Maria Silva';

-- 2. REGISTRAR RECEITAS DOS ATENDIMENTOS EXISTENTES
-- =====================================================

-- Inserir receitas para os atendimentos existentes
INSERT INTO receita (IdAtendimento, IdResponsavel, Valor, DataRecebimento, FormaPagamento, Status, Observacoes)
VALUES 
(2, 4, 180.00, '2025-09-17 18:00:00', 'PIX', 'Pago', 'Receita do atendimento ID 2 - Fernanda Lima'),
(3, 6, 220.00, '2025-09-18 13:00:00', 'Dinheiro', 'Pago', 'Receita do atendimento ID 3 - Roberto Alves');

-- Verificar receitas criadas
SELECT 'Receitas criadas:' as Status;
SELECT r.IdReceita, r.IdAtendimento, r.IdResponsavel, r.Valor, r.FormaPagamento, r.Status
FROM receita r;

-- 3. CALCULAR E REGISTRAR COMISSÕES
-- =====================================================

-- Calcular comissões para os cuidadores dos atendimentos
INSERT INTO comissao (IdCuidador, IdAtendimento, ValorBase, PercentualComissao, ValorComissao, ValorTotal, Status, Observacoes)
SELECT 
    a.IdCuidador,
    a.IdAtendimento,
    a.Valor as ValorBase,
    70.00 as PercentualComissao,
    ROUND(a.Valor * 0.70, 2) as ValorComissao,
    ROUND(a.Valor * 0.70, 2) as ValorTotal,
    'Pendente' as Status,
    CONCAT('Comissão do atendimento ID ', a.IdAtendimento) as Observacoes
FROM atendimento a
WHERE a.IdCuidador IS NOT NULL 
AND a.Valor IS NOT NULL 
AND a.Valor > 0;

-- Verificar comissões criadas
SELECT 'Comissões criadas:' as Status;
SELECT c.IdComissao, c.IdCuidador, c.IdAtendimento, c.ValorBase, c.PercentualComissao, c.ValorComissao, c.Status
FROM comissao c;

-- 4. LIMPAR DADOS DE TESTE DO CHAT
-- =====================================================

-- Remover mensagens de teste
DELETE FROM mensagem 
WHERE Conteudo IN ('asdsad', 'ola') 
OR Conteudo LIKE '%teste%' 
OR Conteudo LIKE '%asd%';

-- Remover chats de teste
DELETE FROM chat 
WHERE Assunto = 'asdasd' 
OR Assunto LIKE '%teste%' 
OR Assunto LIKE '%asd%';

-- Verificar chats limpos
SELECT 'Chats após limpeza:' as Status;
SELECT IdChat, Assunto, Categoria, StatusSuporte, DataCriacao FROM chat;

-- 5. CORRIGIR ENDEREÇOS ÓRFÃOS
-- =====================================================

-- Verificar endereços não utilizados
SELECT 'Endereços órfãos:' as Status;
SELECT e.IdEndereco, e.Cidade, e.Bairro, e.Rua, e.Numero
FROM endereco e
LEFT JOIN responsavel r ON e.IdEndereco = r.IdEndereco
LEFT JOIN cuidador c ON e.IdEndereco = c.IdEndereco
WHERE r.IdEndereco IS NULL AND c.IdEndereco IS NULL;

-- Atribuir endereços aos cuidadores que não têm
UPDATE cuidador 
SET IdEndereco = 1 
WHERE IdCuidador = 1 AND IdEndereco IS NULL;

UPDATE cuidador 
SET IdEndereco = 2 
WHERE IdCuidador = 2 AND IdEndereco IS NULL;

-- Verificar resultado
SELECT 'Cuidadores com endereços:' as Status;
SELECT c.IdCuidador, c.Nome, e.Cidade, e.Bairro, e.Rua
FROM cuidador c
LEFT JOIN endereco e ON c.IdEndereco = e.IdEndereco;

-- 6. ATUALIZAR METAS FINANCEIRAS
-- =====================================================

-- Calcular valores atuais das metas
UPDATE metafinanceira 
SET ValorAtual = (
    SELECT COALESCE(SUM(r.Valor), 0)
    FROM receita r
    WHERE r.DataRecebimento >= metafinanceira.DataInicio 
    AND r.DataRecebimento <= metafinanceira.DataFim
    AND r.Status = 'Pago'
)
WHERE TipoMeta = 'Receita';

-- Atualizar meta de lucro (receitas - despesas)
UPDATE metafinanceira 
SET ValorAtual = (
    SELECT COALESCE(SUM(r.Valor), 0) - COALESCE(SUM(d.Valor), 0)
    FROM receita r, despesa d
    WHERE r.DataRecebimento >= metafinanceira.DataInicio 
    AND r.DataRecebimento <= metafinanceira.DataFim
    AND r.Status = 'Pago'
    AND d.DataDespesa >= metafinanceira.DataInicio 
    AND d.DataDespesa <= metafinanceira.DataFim
    AND d.Status = 'Pago'
)
WHERE TipoMeta = 'Lucro';

-- Atualizar meta de atendimentos
UPDATE metafinanceira 
SET ValorAtual = (
    SELECT COUNT(*)
    FROM atendimento a
    WHERE a.DataInicio >= metafinanceira.DataInicio 
    AND a.DataInicio <= metafinanceira.DataFim
)
WHERE TipoMeta = 'Atendimentos';

-- Verificar metas atualizadas
SELECT 'Metas atualizadas:' as Status;
SELECT TipoMeta, ValorMeta, ValorAtual, 
       ROUND((ValorAtual / ValorMeta) * 100, 2) as PercentualAlcancado
FROM metafinanceira;

-- 7. VERIFICAÇÃO FINAL DOS RELACIONAMENTOS
-- =====================================================

-- Verificar integridade dos relacionamentos principais
SELECT 'VERIFICAÇÃO FINAL - Relacionamentos:' as Status;

-- Atendimentos com responsáveis válidos
SELECT 'Atendimentos com responsáveis:' as Status;
SELECT a.IdAtendimento, a.IdResponsavel, r.Nome as ResponsavelNome, a.Valor
FROM atendimento a
INNER JOIN responsavel r ON a.IdResponsavel = r.IdResponsavel;

-- Atendimentos com cuidadores válidos
SELECT 'Atendimentos com cuidadores:' as Status;
SELECT a.IdAtendimento, a.IdCuidador, c.Nome as CuidadorNome, a.Valor
FROM atendimento a
INNER JOIN cuidador c ON a.IdCuidador = c.IdCuidador;

-- Receitas vinculadas aos atendimentos
SELECT 'Receitas vinculadas:' as Status;
SELECT r.IdReceita, r.IdAtendimento, r.Valor, r.Status, a.DataInicio
FROM receita r
INNER JOIN atendimento a ON r.IdAtendimento = a.IdAtendimento;

-- Comissões vinculadas aos atendimentos
SELECT 'Comissões vinculadas:' as Status;
SELECT c.IdComissao, c.IdAtendimento, c.IdCuidador, c.ValorComissao, c.Status
FROM comissao c
INNER JOIN atendimento a ON c.IdAtendimento = a.IdAtendimento;

-- 8. RELATÓRIO DE CORREÇÕES APLICADAS
-- =====================================================

SELECT 'RELATÓRIO DE CORREÇÕES APLICADAS:' as Status;

-- Resumo financeiro
SELECT 'Resumo Financeiro:' as Status;
SELECT 
    'Receitas' as Tipo,
    COUNT(*) as Quantidade,
    SUM(Valor) as ValorTotal
FROM receita
UNION ALL
SELECT 
    'Comissões' as Tipo,
    COUNT(*) as Quantidade,
    SUM(ValorComissao) as ValorTotal
FROM comissao
UNION ALL
SELECT 
    'Atendimentos' as Tipo,
    COUNT(*) as Quantidade,
    SUM(Valor) as ValorTotal
FROM atendimento;

-- Status dos relacionamentos
SELECT 'Status dos Relacionamentos:' as Status;
SELECT 
    'Responsáveis únicos' as Relacionamento,
    COUNT(*) as Quantidade
FROM responsavel
UNION ALL
SELECT 
    'Atendimentos com receita' as Relacionamento,
    COUNT(*) as Quantidade
FROM atendimento a
INNER JOIN receita r ON a.IdAtendimento = r.IdAtendimento
UNION ALL
SELECT 
    'Atendimentos com comissão' as Relacionamento,
    COUNT(*) as Quantidade
FROM atendimento a
INNER JOIN comissao c ON a.IdAtendimento = c.IdAtendimento;

-- =====================================================
-- FIM DO SCRIPT DE CORREÇÃO
-- =====================================================

