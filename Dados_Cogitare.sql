-- Dados de exemplo para o banco MySQL
USE Cogitare;

-- Inserir dados nas tabelas auxiliares
INSERT INTO Mobilidade (Descricao) VALUES 
('Independente'),
('Cadeira de rodas'),
('Andador'),
('Bengala'),
('Auxílio total');

INSERT INTO NivelAutonomia (Descricao) VALUES 
('Totalmente independente'),
('Parcialmente independente'),
('Dependente de auxílio moderado'),
('Dependente de auxílio intensivo'),
('Totalmente dependente');

INSERT INTO Especialidade (Nome, Descricao) VALUES 
('Cuidados básicos', 'Higiene pessoal, alimentação e mobilidade'),
('Cuidados médicos', 'Administração de medicamentos e acompanhamento médico'),
('Fisioterapia', 'Exercícios e reabilitação física'),
('Psicologia', 'Acompanhamento psicológico e emocional'),
('Enfermagem', 'Cuidados de enfermagem especializados');

INSERT INTO Servico (Nome, Descricao) VALUES 
('Cuidados 24h', 'Acompanhamento integral por 24 horas'),
('Cuidados diurnos', 'Acompanhamento durante o dia'),
('Cuidados noturnos', 'Acompanhamento durante a noite'),
('Cuidados de fim de semana', 'Acompanhamento nos fins de semana'),
('Cuidados esporádicos', 'Acompanhamento conforme necessidade');

INSERT INTO Doenca (Nome, Descricao) VALUES 
('Alzheimer', 'Demência degenerativa'),
('Parkinson', 'Doença neurológica degenerativa'),
('Diabetes', 'Distúrbio do metabolismo da glicose'),
('Hipertensão', 'Pressão arterial elevada'),
('Artrite', 'Inflamação das articulações');

INSERT INTO RestricaoAlimentar (Nome) VALUES 
('Sem açúcar'),
('Sem sal'),
('Sem lactose'),
('Sem glúten'),
('Dieta branda'),
('Dieta líquida');

-- Inserir endereços de exemplo
INSERT INTO Endereco (Cidade, Bairro, Rua, Numero, Complemento, Cep) VALUES 
('São Paulo', 'Vila Madalena', 'Rua Harmonia', '123', 'Apto 45', '05435-000'),
('São Paulo', 'Jardins', 'Alameda Santos', '456', 'Casa 2', '01418-000'),
('São Paulo', 'Moema', 'Rua Bandeira Paulista', '789', 'Apto 12', '04532-000');

-- Inserir responsáveis de exemplo
INSERT INTO Responsavel (IdEndereco, Cpf, Nome, Email, Telefone, DataNascimento, FotoUrl) VALUES 
(1, '123.456.789-00', 'Maria Silva', 'maria.silva@email.com', '(11) 99999-1111', '1980-05-15', NULL),
(2, '987.654.321-00', 'João Santos', 'joao.santos@email.com', '(11) 99999-2222', '1975-08-20', NULL),
(3, '456.789.123-00', 'Ana Costa', 'ana.costa@email.com', '(11) 99999-3333', '1982-12-10', NULL);

-- Inserir cuidadores de exemplo
INSERT INTO Cuidador (IdEndereco, Cpf, Nome, Email, Telefone, Senha, DataNascimento, FotoUrl, Biografia, Fumante, TemFilhos, PossuiCNH, TemCarro) VALUES 
(1, '111.222.333-44', 'Carlos Oliveira', 'carlos.oliveira@email.com', '(11) 88888-1111', '$2b$10$example', '1985-03-25', NULL, 'Cuidador experiente com 5 anos de experiência', 'Não', 'Sim', 'Sim', 'Sim'),
(2, '555.666.777-88', 'Fernanda Lima', 'fernanda.lima@email.com', '(11) 88888-2222', '$2b$10$example', '1990-07-12', NULL, 'Especialista em cuidados com idosos', 'Não', 'Não', 'Sim', 'Não'),
(3, '999.000.111-22', 'Roberto Alves', 'roberto.alves@email.com', '(11) 88888-3333', '$2b$10$example', '1988-11-30', NULL, 'Enfermeiro com especialização em geriatria', 'Não', 'Sim', 'Sim', 'Sim');

-- Inserir idosos de exemplo
INSERT INTO Idoso (IdResponsavel, IdMobilidade, IdNivelAutonomia, Nome, DataNascimento, Sexo, CuidadosMedicos, DescricaoExtra, FotoUrl) VALUES 
(1, 1, 2, 'José Silva', '1950-01-15', 'Masculino', 'Medicamento para pressão arterial', 'Gosta de ler e assistir TV', NULL),
(2, 2, 3, 'Rosa Santos', '1945-06-20', 'Feminino', 'Insulina para diabetes', 'Precisa de auxílio para locomoção', NULL),
(3, 1, 1, 'Pedro Costa', '1955-09-10', 'Masculino', 'Nenhum medicamento específico', 'Independente, gosta de caminhar', NULL);

-- Inserir administrador de exemplo
INSERT INTO Administrador (Usuario, Senha, Tipo, UltimoAcesso) VALUES 
('admin', '$2b$10$xFuotUy80CHp3AgS7fdKkevnzD7b9r47iQP2Jk7nQvSYHOUhcgh0.', 'Admistrador', NOW());

-- Inserir relacionamentos
INSERT INTO CuidadorEspecialidade (IdCuidador, IdEspecialidade) VALUES 
(1, 1), (1, 2),
(2, 1), (2, 3),
(3, 2), (3, 4);

INSERT INTO CuidadorServico (IdCuidador, IdServico) VALUES 
(1, 1), (1, 2),
(2, 2), (2, 3),
(3, 1), (3, 4);

INSERT INTO IdosoDoenca (IdIdoso, IdDoenca) VALUES 
(1, 4), -- José tem hipertensão
(2, 3), -- Rosa tem diabetes
(3, 5); -- Pedro tem artrite

INSERT INTO IdosoRestricaoAlimentar (IdIdoso, IdRestricaoAlimentar) VALUES 
(1, 2), -- José sem sal
(2, 1), -- Rosa sem açúcar
(3, 5); -- Pedro dieta branda
