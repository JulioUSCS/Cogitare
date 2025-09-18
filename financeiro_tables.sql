-- Script para criar tabelas do sistema financeiro
-- Execute este script no seu banco de dados MySQL

-- Tabela de receitas
CREATE TABLE IF NOT EXISTS receita (
    IdReceita INT AUTO_INCREMENT PRIMARY KEY,
    IdAtendimento INT,
    IdResponsavel INT,
    Valor DECIMAL(10,2) NOT NULL,
    DataRecebimento DATETIME DEFAULT CURRENT_TIMESTAMP,
    FormaPagamento VARCHAR(50),
    Status VARCHAR(20) DEFAULT 'Pago',
    Observacoes TEXT,
    FOREIGN KEY (IdAtendimento) REFERENCES atendimento(IdAtendimento),
    FOREIGN KEY (IdResponsavel) REFERENCES responsavel(IdResponsavel)
);

-- Tabela de despesas
CREATE TABLE IF NOT EXISTS despesa (
    IdDespesa INT AUTO_INCREMENT PRIMARY KEY,
    TipoDespesa VARCHAR(50) NOT NULL,
    Categoria VARCHAR(50) NOT NULL,
    Descricao TEXT,
    Valor DECIMAL(10,2) NOT NULL,
    DataDespesa DATETIME DEFAULT CURRENT_TIMESTAMP,
    IdCuidador INT NULL,
    Comprovante VARCHAR(500),
    Status VARCHAR(20) DEFAULT 'Pendente',
    FOREIGN KEY (IdCuidador) REFERENCES cuidador(IdCuidador)
);

-- Tabela de comissões
CREATE TABLE IF NOT EXISTS comissao (
    IdComissao INT AUTO_INCREMENT PRIMARY KEY,
    IdCuidador INT NOT NULL,
    IdAtendimento INT,
    ValorBase DECIMAL(10,2) NOT NULL,
    PercentualComissao DECIMAL(5,2) DEFAULT 70.00,
    ValorComissao DECIMAL(10,2) NOT NULL,
    Bonificacao DECIMAL(10,2) DEFAULT 0.00,
    ValorTotal DECIMAL(10,2) NOT NULL,
    DataCalculo DATETIME DEFAULT CURRENT_TIMESTAMP,
    DataPagamento DATETIME NULL,
    Status VARCHAR(20) DEFAULT 'Pendente',
    Observacoes TEXT,
    FOREIGN KEY (IdCuidador) REFERENCES cuidador(IdCuidador),
    FOREIGN KEY (IdAtendimento) REFERENCES atendimento(IdAtendimento)
);

-- Tabela de inadimplência
CREATE TABLE IF NOT EXISTS inadimplencia (
    IdInadimplencia INT AUTO_INCREMENT PRIMARY KEY,
    IdResponsavel INT NOT NULL,
    IdAtendimento INT,
    ValorDevido DECIMAL(10,2) NOT NULL,
    DataVencimento DATE NOT NULL,
    DiasAtraso INT DEFAULT 0,
    Status VARCHAR(20) DEFAULT 'Em Atraso',
    TentativasCobranca INT DEFAULT 0,
    UltimaTentativa DATETIME NULL,
    Observacoes TEXT,
    FOREIGN KEY (IdResponsavel) REFERENCES responsavel(IdResponsavel),
    FOREIGN KEY (IdAtendimento) REFERENCES atendimento(IdAtendimento)
);

-- Tabela de metas financeiras
CREATE TABLE IF NOT EXISTS metafinanceira (
    IdMeta INT AUTO_INCREMENT PRIMARY KEY,
    TipoMeta VARCHAR(50) NOT NULL,
    Descricao TEXT,
    ValorMeta DECIMAL(10,2) NOT NULL,
    ValorAtual DECIMAL(10,2) DEFAULT 0.00,
    DataInicio DATE NOT NULL,
    DataFim DATE NOT NULL,
    Status VARCHAR(20) DEFAULT 'Ativa',
    DataCriacao DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de configurações financeiras
CREATE TABLE IF NOT EXISTS configuracaofinanceira (
    IdConfig INT AUTO_INCREMENT PRIMARY KEY,
    Chave VARCHAR(100) NOT NULL UNIQUE,
    Valor VARCHAR(500) NOT NULL,
    Descricao TEXT,
    DataAtualizacao DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Inserir configurações padrão
INSERT INTO configuracaofinanceira (Chave, Valor, Descricao) VALUES
('percentual_comissao_padrao', '70.00', 'Percentual padrão de comissão para cuidadores'),
('dias_para_inadimplencia', '5', 'Dias após vencimento para considerar inadimplência'),
('taxa_juros_mora', '2.00', 'Taxa de juros por mês de atraso'),
('meta_receita_mensal', '50000.00', 'Meta de receita mensal'),
('meta_lucro_mensal', '15000.00', 'Meta de lucro mensal');

-- Inserir algumas despesas padrão para teste
INSERT INTO despesa (TipoDespesa, Categoria, Descricao, Valor, Status) VALUES
('Operacional', 'Combustível', 'Combustível para deslocamentos', 500.00, 'Pago'),
('Operacional', 'Alimentação', 'Alimentação para cuidadores', 300.00, 'Pago'),
('Administrativa', 'Internet', 'Internet e telefone', 200.00, 'Pago'),
('Administrativa', 'Aluguel', 'Aluguel do escritório', 1500.00, 'Pago'),
('Marketing', 'Publicidade', 'Anúncios online', 800.00, 'Pago');

-- Inserir algumas metas padrão
INSERT INTO metafinanceira (TipoMeta, Descricao, ValorMeta, DataInicio, DataFim) VALUES
('Receita', 'Meta de receita mensal', 50000.00, '2024-01-01', '2024-12-31'),
('Lucro', 'Meta de lucro mensal', 15000.00, '2024-01-01', '2024-12-31'),
('Atendimentos', 'Meta de atendimentos mensais', 200.00, '2024-01-01', '2024-12-31');