// app.js
import express from 'express';
import path from 'path';
import session from 'express-session';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

// Corrigindo __dirname no ESModules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Importando rotas
import usuarioRoute from './routes/usuarioRoute.js';
import historicoRoute from './routes/historicoRoute.js';
import idososRoute from './routes/idosoRoute.js';
import responsavelRoute from './routes/responsavelRoute.js';
import cuidadorRoute from './routes/cuidadorRoute.js';
import atendimentoRoute from './routes/atendimentoRoute.js';
import pagamentoRoute from './routes/pagamentoRoute.js';
import avaliacaoRoute from './routes/avaliacaoRoute.js';
import dashboardRoute from './routes/dashboardRoute.js';
import chatRoute from './routes/chatRoute.js';
import financeiroRoute from './routes/financeiroRoute.js';
import cache from './utils/cache.js';

const app = express();
const PORT = process.env.PORT || 3000;
const ip = process.env.IP || '';

// Configuração da sessão
app.use(session({
  secret: process.env.KEY,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 30 * 60 * 1000, // 30 minutos
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  }
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 🔥 Arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));
app.use('/view', express.static(path.join(__dirname, 'view')));

// Rotas
app.use('/', usuarioRoute);
app.use('/api', historicoRoute);
app.use('/api', idososRoute);
app.use('/api', responsavelRoute); 
app.use('/api', cuidadorRoute);
app.use('/api', atendimentoRoute);
app.use('/api', pagamentoRoute);
app.use('/api', avaliacaoRoute);
app.use('/api', dashboardRoute);
app.use('/api', chatRoute);
app.use('/api', financeiroRoute);

// Página inicial
app.get('/', (req, res) => {
  if (req.session.usuario) {
    res.redirect('/view/index.html');
  } else {
    res.redirect('/view/login.html');
  }
});

// Servidor
// Limpeza automática de cache a cada 5 minutos
setInterval(() => {
  cache.cleanup();
  console.log('🧹 Cache limpo automaticamente');
}, 5 * 60 * 1000);

app.listen(PORT, ip, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log(`📊 Cache ativo para otimização de performance`);
});
