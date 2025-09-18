-- Script para adaptar tabelas de chat para suporte
-- Execute este script no seu banco de dados MySQL

-- Adicionar campos para suporte na tabela Chat
ALTER TABLE chat 
ADD COLUMN Categoria VARCHAR(50) DEFAULT 'Geral',
ADD COLUMN Prioridade VARCHAR(20) DEFAULT 'Normal',
ADD COLUMN Assunto VARCHAR(200),
ADD COLUMN IdUsuario INT,
ADD COLUMN TipoUsuario VARCHAR(20),
ADD COLUMN StatusSuporte VARCHAR(20) DEFAULT 'Aberto';

-- Adicionar campos para suporte na tabela Mensagem
ALTER TABLE mensagem 
ADD COLUMN TipoMensagem VARCHAR(20) DEFAULT 'Texto',
ADD COLUMN AnexoUrl VARCHAR(500),
ADD COLUMN IsAdmin BOOLEAN DEFAULT FALSE;

-- Criar tabela para categorias de suporte
CREATE TABLE IF NOT EXISTS CategoriaSuporte (
    IdCategoria INT AUTO_INCREMENT PRIMARY KEY,
    Nome VARCHAR(50) NOT NULL,
    Descricao TEXT,
    Ativa BOOLEAN DEFAULT TRUE,
    Ordem INT DEFAULT 0
);

-- Inserir categorias padrão
INSERT INTO CategoriaSuporte (Nome, Descricao, Ordem) VALUES
('Geral', 'Dúvidas gerais sobre o sistema', 1),
('Atendimento', 'Problemas ou dúvidas sobre atendimentos', 2),
('Pagamento', 'Questões relacionadas a pagamentos', 3),
('Técnico', 'Problemas técnicos com o sistema', 4),
('Sugestão', 'Sugestões de melhorias', 5),
('Reclamação', 'Reclamações sobre serviços', 6);

-- Criar tabela para administradores de suporte
CREATE TABLE IF NOT EXISTS AdminSuporte (
    IdAdmin INT AUTO_INCREMENT PRIMARY KEY,
    Nome VARCHAR(100) NOT NULL,
    Email VARCHAR(100) NOT NULL,
    Ativo BOOLEAN DEFAULT TRUE,
    DataCriacao DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Inserir administrador padrão
INSERT INTO AdminSuporte (Nome, Email) VALUES
('Administrador', 'admin@cogitare.com');
