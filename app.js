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


const app = express();
const PORT = process.env.PORT || 3000;

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

// Arquivos estáticos
app.use('/css', express.static(path.join(__dirname, 'public', 'css')));
app.use('/js', express.static(path.join(__dirname, 'public', 'js')));
app.use('/imagens', express.static(path.join(__dirname, 'public', 'imagens')));
app.use('/view', express.static(path.join(__dirname, 'view')));

// Rotas
app.use('/', usuarioRoute);
app.use('/api', historicoRoute);
app.use('/api', idososRoute);
app.use('/api', responsavelRoute); 
app.use('/api', cuidadorRoute);
app.use('/api', atendimentoRoute);

// Página inicial
app.get('/', (req, res) => {
  if (req.session.usuario) {
    res.redirect('/view/index.html');
  } else {
    res.redirect('/view/login.html');
  }
});

// Servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});



