import express from 'express';
import path from 'path';
import session from 'express-session';
import dotenv from 'dotenv';
dotenv.config();

import usuarioRoute from './routes/usuarioRoute.js';
import historicoRoute from './routes/historicoRoute.js';
import idososRoute from './routes/idosoRoute.js';

const __dirname = path.resolve();
const app = express();
const PORT = process.env.PORT || 3000;

// Sessão
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

// Middleware de autenticação
app.use((req, res, next) => {
  const publicPaths = ['/', '/login', '/view/login.html'];

  const isPublicPath = publicPaths.some(publicPath => req.path === publicPath || (publicPath !== '/' && req.path.startsWith(publicPath + '/'))) ||
    req.path.startsWith('/css/') ||
    req.path.startsWith('/js/') ||
    req.path.startsWith('/imagens/') ||
    req.path === '/favicon.ico';

  if (isPublicPath) return next();

  if (!req.session.usuario) {
    if (req.xhr || (req.headers.accept && req.headers.accept.includes('json')) || req.originalUrl.startsWith('/api/')) {
      return res.status(401).json({ sucesso: false, mensagem: 'Não autorizado. Faça login.' });
    } else {
      return res.redirect('/view/login.html?naoAutorizado=true');
    }
  }

  if (Date.now() - req.session.usuario.loginTime > 30 * 60 * 1000) {
    req.session.destroy(err => {
      if (err) console.error('Erro ao destruir sessão:', err);
      if (req.xhr || (req.headers.accept && req.headers.accept.includes('json')) || req.originalUrl.startsWith('/api/')) {
        return res.status(401).json({ sucesso: false, mensagem: 'Sessão expirada. Faça login novamente.' });
      } else {
        return res.redirect('/view/login.html?sessaoExpirada=true');
      }
    });
  } else {
    next();
  }
});

// Rotas
app.use('/', usuarioRoute);
app.use('/api', historicoRoute);
app.use('/api', idososRoute);

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
