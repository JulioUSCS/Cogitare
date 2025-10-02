// routes/usuarioRoute.js
import express from 'express';
import usuarioController from '../controller/usuarioController.js';

const router = express.Router();

// Middleware para proteger a rota - só permite acesso se estiver logado
function autenticar(req, res, next) {
  if (req.session.usuario) {
    next();
  } else {
    res.status(401).json({ mensagem: 'Não autorizado' });
  }
}

// Rota para obter dados do usuário logado
router.get('/api/usuario', autenticar, (req, res) => {
  res.json({ 
    nome: req.session.usuario.nome,
    usuario: req.session.usuario.usuario,
    email: req.session.usuario.email,
    tipo: req.session.usuario.tipo
  });
});

// Rota de login (POST)
router.post('/login', usuarioController.login);

// Rota de logout
router.get('/logout', usuarioController.logout);

export default router; // ← permite importar como "import usuarioRoute from ..."
