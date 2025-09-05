-- Schema MySQL para o projeto Cogitare
-- Baseado no script SQL Server original

-- Criar banco de dados
CREATE DATABASE IF NOT EXISTS Cogitare;
USE Cogitare;

-- Tabela Administrador
CREATE TABLE Administrador (
    IdAdministrador INT AUTO_INCREMENT PRIMARY KEY,
    Usuario VARCHAR(100) NOT NULL UNIQUE,
    Senha VARCHAR(255),
    Tipo VARCHAR(100) NOT NULL,
    UltimoAcesso DATETIME DEFAULT CURRENT_TIMESTAMP,
    CHECK (Tipo IN ('Gestor de Historico', 'Gestor de Usuarios', 'Suporte help-desk', 'Gestor Financeiro', 'Admistrador'))
);

-- Tabela Endereco
CREATE TABLE Endereco (
    IdEndereco INT AUTO_INCREMENT PRIMARY KEY,
    Cidade VARCHAR(100),
    Bairro VARCHAR(100),
    Rua VARCHAR(100),
    Numero VARCHAR(20),
    Complemento VARCHAR(100),
    Cep VARCHAR(20)
);

-- Tabela Responsavel
CREATE TABLE Responsavel (
    IdResponsavel INT AUTO_INCREMENT PRIMARY KEY,
    IdEndereco INT,
    Cpf VARCHAR(20),
    Nome VARCHAR(100),
    Email VARCHAR(100),
    Telefone VARCHAR(20),
    DataNascimento DATE,
    FotoUrl VARCHAR(255),
    FOREIGN KEY (IdEndereco) REFERENCES Endereco(IdEndereco)
);

-- Tabela Cuidador
CREATE TABLE Cuidador (
    IdCuidador INT AUTO_INCREMENT PRIMARY KEY,
    IdEndereco INT,
    Cpf VARCHAR(20),
    Nome VARCHAR(100),
    Email VARCHAR(100),
    Telefone VARCHAR(20),
    Senha VARCHAR(100),
    DataNascimento DATE,
    FotoUrl VARCHAR(255),
    Biografia TEXT,
    Fumante VARCHAR(3) DEFAULT 'Não',
    TemFilhos VARCHAR(3) DEFAULT 'Não',
    PossuiCNH VARCHAR(3) DEFAULT 'Não',
    TemCarro VARCHAR(3) DEFAULT 'Não',
    FOREIGN KEY (IdEndereco) REFERENCES Endereco(IdEndereco),
    CHECK (Fumante IN ('Não', 'Sim')),
    CHECK (TemFilhos IN ('Não', 'Sim')),
    CHECK (PossuiCNH IN ('Não', 'Sim')),
    CHECK (TemCarro IN ('Não', 'Sim'))
);

-- Tabela Mobilidade
CREATE TABLE Mobilidade (
    IdMobilidade INT AUTO_INCREMENT PRIMARY KEY,
    Descricao TEXT
);

-- Tabela NivelAutonomia
CREATE TABLE NivelAutonomia (
    IdNivelAutonomia INT AUTO_INCREMENT PRIMARY KEY,
    Descricao TEXT
);

-- Tabela Idoso
CREATE TABLE Idoso (
    IdIdoso INT AUTO_INCREMENT PRIMARY KEY,
    IdResponsavel INT,
    IdMobilidade INT,
    IdNivelAutonomia INT,
    Nome VARCHAR(100),
    DataNascimento DATE,
    Sexo VARCHAR(20),
    CuidadosMedicos TEXT,
    DescricaoExtra TEXT,
    FotoUrl VARCHAR(255),
    FOREIGN KEY (IdResponsavel) REFERENCES Responsavel(IdResponsavel),
    FOREIGN KEY (IdMobilidade) REFERENCES Mobilidade(IdMobilidade),
    FOREIGN KEY (IdNivelAutonomia) REFERENCES NivelAutonomia(IdNivelAutonomia)
);

-- Tabela Atendimento
CREATE TABLE Atendimento (
    IdAtendimento INT AUTO_INCREMENT PRIMARY KEY,
    IdResponsavel INT,
    IdCuidador INT,
    IdIdoso INT,
    DataInicio DATETIME,
    DataFim DATETIME,
    Status VARCHAR(20),
    Local VARCHAR(255),
    Valor DECIMAL(10, 2),
    ObservacaoExtra TEXT,
    DataCriacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (IdResponsavel) REFERENCES Responsavel(IdResponsavel),
    FOREIGN KEY (IdCuidador) REFERENCES Cuidador(IdCuidador),
    FOREIGN KEY (IdIdoso) REFERENCES Idoso(IdIdoso) ON DELETE CASCADE
);

-- Tabela HistoricoAtendimento
CREATE TABLE HistoricoAtendimento (
    IdHistorico INT AUTO_INCREMENT PRIMARY KEY,
    IdAtendimento INT,
    StatusFinal VARCHAR(20),
    DataRegistro DATETIME DEFAULT CURRENT_TIMESTAMP,
    Observacoes TEXT,
    FOREIGN KEY (IdAtendimento) REFERENCES Atendimento(IdAtendimento) ON DELETE CASCADE
);

-- Tabela HistoricoAdministrador
CREATE TABLE HistoricoAdministrador (
    IdHistoricoAdm INT AUTO_INCREMENT PRIMARY KEY,
    IdAdministrador INT,
    Operacao VARCHAR(255) NOT NULL,
    DataOperacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (IdAdministrador) REFERENCES Administrador(IdAdministrador)
);

-- Tabela HistoricoCuidador
CREATE TABLE HistoricoCuidador (
    IdHistoricoCuidador INT AUTO_INCREMENT PRIMARY KEY,
    IdCuidador INT,
    Operacao VARCHAR(255) NOT NULL,
    DataOperacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (IdCuidador) REFERENCES Cuidador(IdCuidador)
);

-- Tabela HistoricoResponsavel
CREATE TABLE HistoricoResponsavel (
    IdHistoricoResponsavel INT AUTO_INCREMENT PRIMARY KEY,
    IdResponsavel INT,
    Operacao VARCHAR(255) NOT NULL,
    DataOperacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (IdResponsavel) REFERENCES Responsavel(IdResponsavel)
);

-- Tabelas auxiliares
CREATE TABLE Especialidade (
    IdEspecialidade INT AUTO_INCREMENT PRIMARY KEY,
    Nome VARCHAR(100),
    Descricao TEXT
);

CREATE TABLE Servico (
    IdServico INT AUTO_INCREMENT PRIMARY KEY,
    Nome VARCHAR(100),
    Descricao TEXT
);

CREATE TABLE Doenca (
    IdDoenca INT AUTO_INCREMENT PRIMARY KEY,
    Nome VARCHAR(100),
    Descricao TEXT
);

CREATE TABLE RestricaoAlimentar (
    IdRestricaoAlimentar INT AUTO_INCREMENT PRIMARY KEY,
    Nome VARCHAR(100) NOT NULL
);

-- Tabelas de relacionamento
CREATE TABLE CuidadorEspecialidade (
    IdCuidadorEspecialidade INT AUTO_INCREMENT PRIMARY KEY,
    IdCuidador INT,
    IdEspecialidade INT,
    FOREIGN KEY (IdCuidador) REFERENCES Cuidador(IdCuidador),
    FOREIGN KEY (IdEspecialidade) REFERENCES Especialidade(IdEspecialidade)
);

CREATE TABLE CuidadorServico (
    IdCuidadorServico INT AUTO_INCREMENT PRIMARY KEY,
    IdCuidador INT,
    IdServico INT,
    FOREIGN KEY (IdCuidador) REFERENCES Cuidador(IdCuidador),
    FOREIGN KEY (IdServico) REFERENCES Servico(IdServico)
);

CREATE TABLE IdosoDoenca (
    IdIdosoDoenca INT AUTO_INCREMENT PRIMARY KEY,
    IdIdoso INT,
    IdDoenca INT,
    FOREIGN KEY (IdIdoso) REFERENCES Idoso(IdIdoso) ON DELETE CASCADE,
    FOREIGN KEY (IdDoenca) REFERENCES Doenca(IdDoenca)
);

CREATE TABLE IdosoRestricaoAlimentar (
    IdIdosoRestricaoAlimentar INT AUTO_INCREMENT PRIMARY KEY,
    IdIdoso INT,
    IdRestricaoAlimentar INT,
    FOREIGN KEY (IdIdoso) REFERENCES Idoso(IdIdoso) ON DELETE CASCADE,
    FOREIGN KEY (IdRestricaoAlimentar) REFERENCES RestricaoAlimentar(IdRestricaoAlimentar)
);

-- Tabelas adicionais
CREATE TABLE Avaliacao (
    IdAvaliacao INT AUTO_INCREMENT PRIMARY KEY,
    IdResponsavel INT,
    IdCuidador INT,
    IdAtendimento INT,
    Nota INT,
    Comentario TEXT,
    DataAvaliacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (IdResponsavel) REFERENCES Responsavel(IdResponsavel),
    FOREIGN KEY (IdCuidador) REFERENCES Cuidador(IdCuidador),
    FOREIGN KEY (IdAtendimento) REFERENCES Atendimento(IdAtendimento)
);

CREATE TABLE Certificado (
    IdCertificado INT AUTO_INCREMENT PRIMARY KEY,
    IdCuidador INT,
    Descricao TEXT,
    UrlCertificado VARCHAR(255),
    FOREIGN KEY (IdCuidador) REFERENCES Cuidador(IdCuidador)
);

CREATE TABLE Chat (
    IdChat INT AUTO_INCREMENT PRIMARY KEY,
    IdCuidador INT,
    IdResponsavel INT,
    DataCriacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    Status VARCHAR(20),
    FOREIGN KEY (IdCuidador) REFERENCES Cuidador(IdCuidador),
    FOREIGN KEY (IdResponsavel) REFERENCES Responsavel(IdResponsavel)
);

CREATE TABLE Mensagem (
    IdMensagem INT AUTO_INCREMENT PRIMARY KEY,
    IdChat INT,
    IdRemetente INT,
    RemetenteTipo VARCHAR(20),
    Conteudo TEXT,
    DataEnvio DATETIME DEFAULT CURRENT_TIMESTAMP,
    Lida VARCHAR(10),
    FOREIGN KEY (IdChat) REFERENCES Chat(IdChat)
);

CREATE TABLE Disponibilidade (
    IdDisponibilidade INT AUTO_INCREMENT PRIMARY KEY,
    IdCuidador INT,
    DiaSemana VARCHAR(20),
    DataInicio DATETIME,
    DataFim DATETIME,
    Observacoes TEXT,
    Recorrente BOOLEAN,
    FOREIGN KEY (IdCuidador) REFERENCES Cuidador(IdCuidador)
);

CREATE TABLE Experiencia (
    IdExperiencia INT AUTO_INCREMENT PRIMARY KEY,
    IdCuidador INT,
    Descricao TEXT,
    FOREIGN KEY (IdCuidador) REFERENCES Cuidador(IdCuidador)
);

CREATE TABLE Formacao (
    IdFormacao INT AUTO_INCREMENT PRIMARY KEY,
    IdCuidador INT,
    Descricao TEXT,
    FOREIGN KEY (IdCuidador) REFERENCES Cuidador(IdCuidador)
);

CREATE TABLE Pagamento (
    IdPagamento INT AUTO_INCREMENT PRIMARY KEY,
    IdAtendimento INT,
    MetodoPagamento VARCHAR(20),
    StatusPagamento VARCHAR(20),
    DataPagamento DATETIME DEFAULT CURRENT_TIMESTAMP,
    CodigoTransacao VARCHAR(255),
    FOREIGN KEY (IdAtendimento) REFERENCES Atendimento(IdAtendimento)
);

CREATE TABLE RegistroProfissional (
    IdRegistro INT AUTO_INCREMENT PRIMARY KEY,
    IdCuidador INT,
    RegistroCRM VARCHAR(50),
    RegistroCREFITO VARCHAR(50),
    RegistroCOREN VARCHAR(50),
    RegistroCRP VARCHAR(50),
    DataRegistro DATE NOT NULL,
    StatusRegistro VARCHAR(20),
    FOREIGN KEY (IdCuidador) REFERENCES Cuidador(IdCuidador),
    CHECK (StatusRegistro IN ('Inativo', 'Ativo'))
);
