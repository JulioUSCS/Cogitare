# Cogitare

Sistema de gestão para cuidados ao idoso (painel administrativo).

O **Cogitare** centraliza o cadastro de idosos, cuidadores e responsáveis, além de atendimentos, pagamentos, avaliações, chat e relatórios financeiros em um único painel web.

---

## Funcionalidades

- **Dashboard** — Visão geral do sistema com estatísticas e indicadores
- **Cuidadores** — Cadastro e gestão de cuidadores
- **Responsáveis** — Cadastro e gestão de responsáveis pelos idosos
- **Idosos** — Cadastro e gestão de idosos
- **Atendimentos** — Agendamento e controle de atendimentos
- **Pagamentos** — Gestão de pagamentos
- **Avaliações** — Avaliações e feedback
- **Chat** — Comunicação e suporte
- **Financeiro** — Relatórios e indicadores financeiros
- **Histórico** — Histórico administrativo, de atendimento, cuidador e responsável

---

## Tecnologias

| Camada | Tecnologia |
|--------|------------|
| **Backend** | Node.js, Express 5 (ES Modules) |
| **Banco de dados** | MySQL (mysql2 com connection pool) |
| **Autenticação** | express-session, bcrypt |
| **Configuração** | dotenv |
| **Frontend** | HTML/CSS estático, Chart.js, Font Awesome |
| **Otimização** | Cache em memória (TTL 5 min, limpeza automática) |

---

## Estrutura do projeto

```
├── app.js              # Entrada da aplicação, rotas e sessão
├── config/
│   └── db.js           # Pool de conexões MySQL
├── routes/             # Rotas da API (usuario, historico, idoso, responsavel,
│                       # cuidador, atendimento, pagamento, avaliacao,
│                       # dashboard, chat, financeiro, dadosAuxiliares)
├── controllers/        # Lógica de negócio
├── database/           # Stored procedures (SQL) por módulo
├── view/               # Páginas HTML
├── public/             # Assets (CSS, imagens)
└── utils/
    └── cache.js       # Cache em memória
```

---

## Pré-requisitos

- **Node.js** — Versão compatível com ES Modules e dependências do projeto
- **MySQL** — Banco de dados criado e stored procedures do diretório `database/` executadas

---

## Instalação

1. Clone o repositório e entre na pasta do projeto.

2. Instale as dependências:

   ```bash
   npm install
   ```

3. Crie um arquivo `.env` na raiz do projeto com as variáveis de ambiente:

   | Variável | Obrigatório | Descrição |
   |----------|-------------|-----------|
   | `PORT` | Não | Porta do servidor (padrão: 3000) |
   | `IP` | Não | IP para bind do servidor |
   | `KEY` | Sim | Segredo da sessão (express-session) |
   | `DB_SERVER` | Sim | Host do MySQL |
   | `DB_USER` | Sim | Usuário do MySQL |
   | `DB_PASSWORD` | Sim | Senha do MySQL |
   | `DB_DATABASE` | Sim | Nome do banco de dados |
   | `DB_PORT` | Sim | Porta do MySQL |
   | `NODE_ENV` | Não | Ambiente (ex.: production) |

4. Execute os scripts SQL em `database/` no MySQL para criar as stored procedures necessárias.

---

## Como executar

```bash
npm start
```

Ou:

```bash
node app.js
```

Acesse no navegador `http://localhost:3000` (ou a porta definida em `PORT`). A aplicação redireciona para a tela de login ou para o painel conforme a sessão do usuário.

---

## Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes (Copyright 2025 JulioUSCS).
