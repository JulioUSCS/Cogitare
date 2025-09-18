-- =====================================================
-- DADOS FICTÍCIOS PARA SISTEMA COGITARE
-- Script para popular todas as tabelas com dados realistas
-- =====================================================

-- LIMPAR DADOS EXISTENTES (CUIDADO!)
-- =====================================================
-- Descomente as linhas abaixo se quiser limpar dados existentes
-- DELETE FROM mensagem;
-- DELETE FROM chat;
-- DELETE FROM avaliacao;
-- DELETE FROM comissao;
-- DELETE FROM receita;
-- DELETE FROM despesa;
-- DELETE FROM inadimplencia;
-- DELETE FROM atendimento;
-- DELETE FROM idoso;
-- DELETE FROM cuidador;
-- DELETE FROM responsavel;
-- DELETE FROM endereco;

-- 1. ENDEREÇOS FICTÍCIOS
-- =====================================================
INSERT INTO endereco (IdEndereco, Cidade, Bairro, Rua, Numero, Complemento, Cep) VALUES
(4, 'São Paulo', 'Vila Madalena', 'Rua Harmonia', '456', 'Apto 23', '05435-001'),
(5, 'São Paulo', 'Jardins', 'Alameda Santos', '789', 'Casa 5', '01418-001'),
(6, 'São Paulo', 'Moema', 'Rua Bandeira Paulista', '321', 'Apto 45', '04532-001'),
(7, 'São Paulo', 'Pinheiros', 'Rua dos Pinheiros', '654', 'Casa 12', '05422-000'),
(8, 'São Paulo', 'Itaim Bibi', 'Rua Bandeira Paulista', '987', 'Apto 67', '04532-002'),
(9, 'São Paulo', 'Vila Olímpia', 'Rua Funchal', '147', 'Sala 89', '04551-000'),
(10, 'São Paulo', 'Brooklin', 'Rua dos Três Irmãos', '258', 'Apto 34', '04562-000'),
(11, 'São Paulo', 'Vila Nova Conceição', 'Rua Bandeira Paulista', '369', 'Casa 8', '04532-003'),
(12, 'São Paulo', 'Higienópolis', 'Rua da Consolação', '741', 'Apto 56', '01302-000'),
(13, 'São Paulo', 'Perdizes', 'Rua Cardeal Arcoverde', '852', 'Casa 3', '05008-000'),
(14, 'São Paulo', 'Vila Madalena', 'Rua Harmonia', '963', 'Apto 78', '05435-002'),
(15, 'São Paulo', 'Jardins', 'Alameda Santos', '159', 'Casa 9', '01418-002');

-- 2. RESPONSÁVEIS FICTÍCIOS
-- =====================================================
INSERT INTO responsavel (IdResponsavel, IdEndereco, Cpf, Nome, Email, Telefone, DataNascimento, FotoUrl) VALUES
(8, 4, '12345678901', 'Ana Carolina Santos', 'ana.santos@email.com', '(11) 99999-1111', '1980-05-15', NULL),
(9, 5, '23456789012', 'Roberto Silva', 'roberto.silva@email.com', '(11) 99999-2222', '1975-08-22', NULL),
(10, 6, '34567890123', 'Mariana Costa', 'mariana.costa@email.com', '(11) 99999-3333', '1982-12-10', NULL),
(11, 7, '45678901234', 'Carlos Eduardo', 'carlos.eduardo@email.com', '(11) 99999-4444', '1978-03-28', NULL),
(12, 8, '56789012345', 'Patricia Lima', 'patricia.lima@email.com', '(11) 99999-5555', '1985-07-14', NULL),
(13, 9, '67890123456', 'João Pedro', 'joao.pedro@email.com', '(11) 99999-6666', '1972-11-05', NULL),
(14, 10, '78901234567', 'Fernanda Oliveira', 'fernanda.oliveira@email.com', '(11) 99999-7777', '1988-09-18', NULL),
(15, 11, '89012345678', 'Ricardo Alves', 'ricardo.alves@email.com', '(11) 99999-8888', '1976-04-12', NULL);

-- 3. CUIDADORES FICTÍCIOS
-- =====================================================
INSERT INTO cuidador (IdCuidador, IdEndereco, Cpf, Nome, Email, Telefone, Senha, DataNascimento, FotoUrl, Biografia, Fumante, TemFilhos, PossuiCNH, TemCarro) VALUES
(4, 12, '11122233344', 'Lucia Mendes', 'lucia.mendes@email.com', '(11) 88888-4444', '$2b$10$example', '1983-06-20', NULL, 'Enfermeira com 8 anos de experiência em cuidados geriátricos', 'Não', 'Sim', 'Sim', 'Sim'),
(5, 13, '22233344455', 'Paulo Roberto', 'paulo.roberto@email.com', '(11) 88888-5555', '$2b$10$example', '1987-01-15', NULL, 'Fisioterapeuta especializado em reabilitação de idosos', 'Não', 'Não', 'Sim', 'Não'),
(6, 14, '33344455566', 'Cristina Santos', 'cristina.santos@email.com', '(11) 88888-6666', '$2b$10$example', '1981-11-08', NULL, 'Psicóloga com experiência em demência e Alzheimer', 'Não', 'Sim', 'Sim', 'Sim'),
(7, 15, '44455566677', 'Marcos Antonio', 'marcos.antonio@email.com', '(11) 88888-7777', '$2b$10$example', '1979-09-25', NULL, 'Cuidador experiente com certificação em primeiros socorros', 'Não', 'Sim', 'Não', 'Não');

-- 4. IDOSOS FICTÍCIOS
-- =====================================================
INSERT INTO idoso (IdIdoso, IdResponsavel, IdMobilidade, IdNivelAutonomia, Nome, DataNascimento, Sexo, CuidadosMedicos, DescricaoExtra, FotoUrl) VALUES
(8, 8, 2, 3, 'Dona Maria', '1945-03-10', 'Feminino', 'Hipertensão, Diabetes tipo 2', 'Gosta de ouvir música clássica e ler livros', NULL),
(9, 9, 1, 2, 'Seu José', '1940-07-22', 'Masculino', 'Artrite, Problemas de visão', 'Ex-professor, adora contar histórias', NULL),
(10, 10, 3, 4, 'Dona Rosa', '1938-12-05', 'Feminino', 'Alzheimer, Osteoporose', 'Necessita acompanhamento constante', NULL),
(11, 11, 1, 1, 'Seu Antonio', '1942-05-18', 'Masculino', 'Hipertensão controlada', 'Muito ativo, gosta de caminhar', NULL),
(12, 12, 4, 4, 'Dona Carmen', '1935-08-30', 'Feminino', 'Parkinson, Diabetes', 'Necessita auxílio para alimentação', NULL),
(13, 13, 2, 3, 'Seu Francisco', '1943-11-12', 'Masculino', 'Problemas cardíacos', 'Gosta de assistir TV e conversar', NULL),
(14, 14, 1, 2, 'Dona Isabel', '1941-04-25', 'Feminino', 'Osteoporose leve', 'Muito independente, gosta de cozinhar', NULL),
(15, 15, 3, 3, 'Seu Manuel', '1939-10-08', 'Masculino', 'Demência vascular', 'Necessita supervisão para medicação', NULL);

-- 5. ATENDIMENTOS FICTÍCIOS
-- =====================================================
INSERT INTO atendimento (IdAtendimento, IdResponsavel, IdCuidador, IdIdoso, DataInicio, DataFim, Status, Local, Valor, ObservacaoExtra, DataCriacao) VALUES
(4, 8, 4, 8, '2025-09-20 08:00:00', '2025-09-20 12:00:00', 'Concluído', 'Rua Harmonia, 456 - Vila Madalena', 200.00, 'Atendimento de 4 horas para cuidados básicos', '2025-09-19 10:00:00'),
(5, 9, 5, 9, '2025-09-21 14:00:00', '2025-09-21 18:00:00', 'Concluído', 'Alameda Santos, 789 - Jardins', 180.00, 'Sessão de fisioterapia e acompanhamento', '2025-09-20 09:00:00'),
(6, 10, 6, 10, '2025-09-22 09:00:00', '2025-09-22 17:00:00', 'Concluído', 'Rua Bandeira Paulista, 321 - Moema', 320.00, 'Acompanhamento de 8 horas para paciente com Alzheimer', '2025-09-21 11:00:00'),
(7, 11, 7, 11, '2025-09-23 10:00:00', '2025-09-23 14:00:00', 'Concluído', 'Rua dos Pinheiros, 654 - Pinheiros', 160.00, 'Cuidados básicos e companhia', '2025-09-22 08:00:00'),
(8, 12, 4, 12, '2025-09-24 08:00:00', '2025-09-24 20:00:00', 'Concluído', 'Rua Bandeira Paulista, 987 - Itaim Bibi', 480.00, 'Atendimento de 12 horas para paciente com Parkinson', '2025-09-23 10:00:00'),
(9, 13, 5, 13, '2025-09-25 15:00:00', '2025-09-25 19:00:00', 'Concluído', 'Rua Funchal, 147 - Vila Olímpia', 200.00, 'Fisioterapia e cuidados cardíacos', '2025-09-24 12:00:00'),
(10, 14, 6, 14, '2025-09-26 11:00:00', '2025-09-26 15:00:00', 'Concluído', 'Rua dos Três Irmãos, 258 - Brooklin', 180.00, 'Acompanhamento psicológico e cuidados básicos', '2025-09-25 09:00:00'),
(11, 15, 7, 15, '2025-09-27 09:00:00', '2025-09-27 13:00:00', 'Concluído', 'Rua Bandeira Paulista, 369 - Vila Nova Conceição', 200.00, 'Supervisão de medicação e cuidados gerais', '2025-09-26 14:00:00'),
(12, 8, 4, 8, '2025-09-28 08:00:00', '2025-09-28 12:00:00', 'Agendado', 'Rua Harmonia, 456 - Vila Madalena', 200.00, 'Retorno para acompanhamento', '2025-09-27 16:00:00'),
(13, 9, 5, 9, '2025-09-29 14:00:00', '2025-09-29 18:00:00', 'Agendado', 'Alameda Santos, 789 - Jardins', 180.00, 'Continuidade da fisioterapia', '2025-09-28 10:00:00');

-- 6. RECEITAS FICTÍCIAS
-- =====================================================
INSERT INTO receita (IdReceita, IdAtendimento, IdResponsavel, Valor, DataRecebimento, FormaPagamento, Status, Observacoes) VALUES
(3, 4, 8, 200.00, '2025-09-20 12:30:00', 'PIX', 'Pago', 'Receita do atendimento ID 4 - Dona Maria'),
(4, 5, 9, 180.00, '2025-09-21 18:15:00', 'Cartão de Crédito', 'Pago', 'Receita do atendimento ID 5 - Seu José'),
(5, 6, 10, 320.00, '2025-09-22 17:30:00', 'Transferência', 'Pago', 'Receita do atendimento ID 6 - Dona Rosa'),
(6, 7, 11, 160.00, '2025-09-23 14:15:00', 'PIX', 'Pago', 'Receita do atendimento ID 7 - Seu Antonio'),
(7, 8, 12, 480.00, '2025-09-24 20:30:00', 'Dinheiro', 'Pago', 'Receita do atendimento ID 8 - Dona Carmen'),
(8, 9, 13, 200.00, '2025-09-25 19:00:00', 'Cartão de Débito', 'Pago', 'Receita do atendimento ID 9 - Seu Francisco'),
(9, 10, 14, 180.00, '2025-09-26 15:20:00', 'PIX', 'Pago', 'Receita do atendimento ID 10 - Dona Isabel'),
(10, 11, 15, 200.00, '2025-09-27 13:10:00', 'Transferência', 'Pago', 'Receita do atendimento ID 11 - Seu Manuel');

-- 7. COMISSÕES FICTÍCIAS
-- =====================================================
INSERT INTO comissao (IdComissao, IdCuidador, IdAtendimento, ValorBase, PercentualComissao, ValorComissao, ValorTotal, DataCalculo, Status, Observacoes) VALUES
(3, 4, 4, 200.00, 70.00, 140.00, 140.00, '2025-09-20 12:30:00', 'Pago', 'Comissão do atendimento ID 4'),
(4, 5, 5, 180.00, 70.00, 126.00, 126.00, '2025-09-21 18:15:00', 'Pago', 'Comissão do atendimento ID 5'),
(5, 6, 6, 320.00, 70.00, 224.00, 224.00, '2025-09-22 17:30:00', 'Pago', 'Comissão do atendimento ID 6'),
(6, 7, 7, 160.00, 70.00, 112.00, 112.00, '2025-09-23 14:15:00', 'Pago', 'Comissão do atendimento ID 7'),
(7, 4, 8, 480.00, 70.00, 336.00, 336.00, '2025-09-24 20:30:00', 'Pago', 'Comissão do atendimento ID 8'),
(8, 5, 9, 200.00, 70.00, 140.00, 140.00, '2025-09-25 19:00:00', 'Pago', 'Comissão do atendimento ID 9'),
(9, 6, 10, 180.00, 70.00, 126.00, 126.00, '2025-09-26 15:20:00', 'Pago', 'Comissão do atendimento ID 10'),
(10, 7, 11, 200.00, 70.00, 140.00, 140.00, '2025-09-27 13:10:00', 'Pago', 'Comissão do atendimento ID 11');

-- 8. DESPESAS FICTÍCIAS
-- =====================================================
INSERT INTO despesa (IdDespesa, TipoDespesa, Categoria, Descricao, Valor, DataDespesa, IdCuidador, Comprovante, Status) VALUES
(6, 'Operacional', 'Combustível', 'Combustível para deslocamentos dos cuidadores', 800.00, '2025-09-20 10:00:00', NULL, NULL, 'Pago'),
(7, 'Operacional', 'Alimentação', 'Alimentação para cuidadores em atendimentos longos', 450.00, '2025-09-21 12:00:00', NULL, NULL, 'Pago'),
(8, 'Administrativa', 'Internet', 'Internet e telefone do escritório', 250.00, '2025-09-22 14:00:00', NULL, NULL, 'Pago'),
(9, 'Administrativa', 'Aluguel', 'Aluguel do escritório', 2000.00, '2025-09-23 16:00:00', NULL, NULL, 'Pago'),
(10, 'Marketing', 'Publicidade', 'Anúncios online e materiais promocionais', 1200.00, '2025-09-24 18:00:00', NULL, NULL, 'Pago'),
(11, 'Recursos Humanos', 'Treinamento', 'Curso de capacitação para cuidadores', 600.00, '2025-09-25 20:00:00', NULL, NULL, 'Pago'),
(12, 'Operacional', 'Material', 'Material de higiene e cuidados', 300.00, '2025-09-26 22:00:00', NULL, NULL, 'Pago'),
(13, 'Administrativa', 'Contabilidade', 'Serviços de contabilidade', 400.00, '2025-09-27 08:00:00', NULL, NULL, 'Pago');

-- 9. AVALIAÇÕES FICTÍCIAS
-- =====================================================
INSERT INTO avaliacao (IdAvaliacao, IdResponsavel, IdCuidador, IdAtendimento, Nota, Comentario, DataAvaliacao) VALUES
(1, 8, 4, 4, 5, 'Excelente atendimento! Lucia foi muito cuidadosa e atenciosa com minha mãe.', '2025-09-20 13:00:00'),
(2, 9, 5, 5, 4, 'Muito bom profissional. Paulo ajudou muito meu pai com a fisioterapia.', '2025-09-21 19:00:00'),
(3, 10, 6, 6, 5, 'Cristina tem muita paciência e conhecimento. Recomendo!', '2025-09-22 18:00:00'),
(4, 11, 7, 7, 4, 'Marcos é um cuidador dedicado e responsável.', '2025-09-23 15:00:00'),
(5, 12, 4, 8, 5, 'Lucia novamente superou nossas expectativas. Muito profissional!', '2025-09-24 21:00:00'),
(6, 13, 5, 9, 4, 'Paulo é muito competente na fisioterapia.', '2025-09-25 20:00:00'),
(7, 14, 6, 10, 5, 'Cristina tem um dom especial para lidar com idosos.', '2025-09-26 16:00:00'),
(8, 15, 7, 11, 4, 'Marcos é cuidadoso e atencioso com os detalhes.', '2025-09-27 14:00:00');

-- 10. CHATS DE SUPORTE FICTÍCIOS
-- =====================================================
INSERT INTO chat (IdChat, IdCuidador, IdResponsavel, DataCriacao, Status, Categoria, Prioridade, Assunto, IdUsuario, TipoUsuario, StatusSuporte) VALUES
(4, 4, NULL, '2025-09-20 15:00:00', 'Ativo', 'Atendimento', 'Normal', 'Dúvida sobre medicação da paciente', 4, 'cuidador', 'Aberto'),
(5, NULL, 9, '2025-09-21 16:00:00', 'Ativo', 'Pagamento', 'Alta', 'Problema com pagamento do atendimento', 9, 'responsavel', 'Em Andamento'),
(6, 6, NULL, '2025-09-22 17:00:00', 'Ativo', 'Técnico', 'Normal', 'Dificuldade para acessar o sistema', 6, 'cuidador', 'Fechado'),
(7, NULL, 11, '2025-09-23 18:00:00', 'Ativo', 'Geral', 'Normal', 'Sugestão de melhoria no sistema', 11, 'responsavel', 'Aberto'),
(8, 7, NULL, '2025-09-24 19:00:00', 'Ativo', 'Atendimento', 'Alta', 'Emergência com paciente', 7, 'cuidador', 'Em Andamento');

-- 11. MENSAGENS DE SUPORTE FICTÍCIAS
-- =====================================================
INSERT INTO mensagem (IdMensagem, IdChat, IdRemetente, RemetenteTipo, Conteudo, DataEnvio, Lida, TipoMensagem, AnexoUrl, IsAdmin) VALUES
(5, 4, 4, 'cuidador', 'Olá, tenho uma dúvida sobre a medicação da Dona Maria. Ela precisa tomar o remédio antes ou depois das refeições?', '2025-09-20 15:00:00', 'Sim', 'Texto', NULL, 0),
(6, 4, 1, 'admin', 'Olá Lucia! A medicação deve ser tomada 30 minutos antes das refeições, conforme prescrição médica. Qualquer dúvida, pode me chamar!', '2025-09-20 15:15:00', 'Sim', 'Texto', NULL, 1),
(7, 5, 9, 'responsavel', 'Boa tarde! Tentei fazer o pagamento do atendimento de ontem, mas o PIX não está funcionando. Podem me ajudar?', '2025-09-21 16:00:00', 'Sim', 'Texto', NULL, 0),
(8, 5, 1, 'admin', 'Boa tarde Roberto! Vou verificar o problema com o PIX. Enquanto isso, você pode tentar pagar via cartão de crédito. Vou te enviar o link.', '2025-09-21 16:10:00', 'Sim', 'Texto', NULL, 1),
(9, 6, 6, 'cuidador', 'Não consigo acessar o sistema para registrar o atendimento de hoje. A página fica carregando infinitamente.', '2025-09-22 17:00:00', 'Sim', 'Texto', NULL, 0),
(10, 6, 1, 'admin', 'Cristina, tente limpar o cache do navegador ou usar outro navegador. Se o problema persistir, me avise que vou verificar do nosso lado.', '2025-09-22 17:05:00', 'Sim', 'Texto', NULL, 1),
(11, 7, 11, 'responsavel', 'Sugestão: seria interessante ter um sistema de lembretes para os cuidadores sobre os horários dos medicamentos.', '2025-09-23 18:00:00', 'Sim', 'Texto', NULL, 0),
(12, 8, 7, 'cuidador', 'URGENTE: O Seu Manuel está com febre alta e não consegue tomar a medicação. O que devo fazer?', '2025-09-24 19:00:00', 'Sim', 'Texto', NULL, 0),
(13, 8, 1, 'admin', 'Marcos, ligue imediatamente para o médico do Seu Manuel. Se não conseguir contato, leve ao pronto-socorro mais próximo. Mantenha-me informado!', '2025-09-24 19:05:00', 'Sim', 'Texto', NULL, 1);

-- 12. ATUALIZAR METAS FINANCEIRAS
-- =====================================================
UPDATE metafinanceira 
SET ValorAtual = (
    SELECT COALESCE(SUM(r.Valor), 0)
    FROM receita r
    WHERE r.DataRecebimento >= metafinanceira.DataInicio 
    AND r.DataRecebimento <= metafinanceira.DataFim
    AND r.Status = 'Pago'
)
WHERE TipoMeta = 'Receita';

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

UPDATE metafinanceira 
SET ValorAtual = (
    SELECT COUNT(*)
    FROM atendimento a
    WHERE a.DataInicio >= metafinanceira.DataInicio 
    AND a.DataInicio <= metafinanceira.DataFim
)
WHERE TipoMeta = 'Atendimentos';

-- 13. RELATÓRIO FINAL DOS DADOS INSERIDOS
-- =====================================================
SELECT 'RELATÓRIO FINAL - DADOS FICTÍCIOS INSERIDOS:' as Status;

SELECT 'Endereços:' as Tabela, COUNT(*) as Quantidade FROM endereco
UNION ALL
SELECT 'Responsáveis:' as Tabela, COUNT(*) as Quantidade FROM responsavel
UNION ALL
SELECT 'Cuidadores:' as Tabela, COUNT(*) as Quantidade FROM cuidador
UNION ALL
SELECT 'Idosos:' as Tabela, COUNT(*) as Quantidade FROM idoso
UNION ALL
SELECT 'Atendimentos:' as Tabela, COUNT(*) as Quantidade FROM atendimento
UNION ALL
SELECT 'Receitas:' as Tabela, COUNT(*) as Quantidade FROM receita
UNION ALL
SELECT 'Comissões:' as Tabela, COUNT(*) as Quantidade FROM comissao
UNION ALL
SELECT 'Despesas:' as Tabela, COUNT(*) as Quantidade FROM despesa
UNION ALL
SELECT 'Avaliações:' as Tabela, COUNT(*) as Quantidade FROM avaliacao
UNION ALL
SELECT 'Chats:' as Tabela, COUNT(*) as Quantidade FROM chat
UNION ALL
SELECT 'Mensagens:' as Tabela, COUNT(*) as Quantidade FROM mensagem;

-- Resumo financeiro
SELECT 'RESUMO FINANCEIRO:' as Status;
SELECT 
    'Total Receitas' as Item,
    SUM(Valor) as Valor
FROM receita
WHERE Status = 'Pago'
UNION ALL
SELECT 
    'Total Despesas' as Item,
    SUM(Valor) as Valor
FROM despesa
WHERE Status = 'Pago'
UNION ALL
SELECT 
    'Total Comissões' as Item,
    SUM(ValorComissao) as Valor
FROM comissao
WHERE Status = 'Pago'
UNION ALL
SELECT 
    'Lucro Líquido' as Item,
    (SELECT SUM(Valor) FROM receita WHERE Status = 'Pago') - 
    (SELECT SUM(Valor) FROM despesa WHERE Status = 'Pago') as Valor;

-- =====================================================
-- FIM DO SCRIPT DE DADOS FICTÍCIOS
-- =====================================================
