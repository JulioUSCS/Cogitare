require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');
const dbConfig = require('./config/db');
// Removido mssql - usando mysql2

// Importar rotas
const usuarioRoute = require('./routes/usuarioRoute');
const historicoRoute = require('./routes/historicoRoute');
const idososRoute = require('./routes/idosoRoute');


const app = express();
const PORT = process.env.PORT || 3000;

app.use(session({
    secret: process.env.KEY,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 30 * 60 * 1000,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production'
    }
}));


app.use(express.urlencoded({ extended: true }));
app.use(express.json());


app.use('/css', express.static(path.join(__dirname, 'public', 'css')));
app.use('/js', express.static(path.join(__dirname, 'public', 'js')));
app.use('/imagens', express.static(path.join(__dirname, 'public', 'imagens')));
app.use('/view', express.static(path.join(__dirname, 'view')));


app.use((req, res, next) => {
    const publicPaths = [
        '/',
        '/login',
        '/view/login.html'
    ];


    const isPublicPath = publicPaths.some(publicPath => req.path === publicPath || (publicPath !== '/' && req.path.startsWith(publicPath + '/'))) ||
        req.path.startsWith('/css/') ||
        req.path.startsWith('/js/') ||
        req.path.startsWith('/imagens/') ||
        req.path === '/favicon.ico';

    if (isPublicPath) {
        return next();
    }


    if (!req.session.usuario) {
        if (req.xhr || (req.headers.accept && req.headers.accept.includes('json')) || req.originalUrl.startsWith('/api/')) {
            return res.status(401).json({ sucesso: false, mensagem: 'Não autorizado. Faça login para acessar esta funcionalidade.' });
        } else {
            return res.redirect('/view/login.html?naoAutorizado=true');
        }
    }

    if (Date.now() - req.session.usuario.loginTime > 30 * 60 * 1000) {
        req.session.destroy(err => {
            if (err) {
                console.error('Erro ao destruir sessão:', err);
            }
            // *** CORREÇÃO DO TypeError AQUI: Garante que req.headers.accept existe ***
            if (req.xhr || (req.headers.accept && req.headers.accept.includes('json')) || req.originalUrl.startsWith('/api/')) {
                return res.status(401).json({ sucesso: false, mensagem: 'Sessão expirada. Por favor, faça login novamente.' });
            } else {
                return res.redirect('/view/login.html?sessaoExpirada=true');
            }
        });
    } else {

        next();
    }
});


app.get('/view/index.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'view', 'index.html'));
});

app.use('/', usuarioRoute);
app.use('/api', historicoRoute);
app.use('/api', idososRoute);



app.get('/', (req, res) => {
    if (req.session.usuario) {
        res.redirect('/view/index.html');
    } else {
        res.redirect('/view/login.html');
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});