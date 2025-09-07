// routes/historicoRoute.js
import express from 'express';
import historicoController from '../controller/historicoController.js';

const router = express.Router();

function autenticar(req, res, next) {
  if (req.session.usuario) {
    next();
  } else {
    res.status(401).json({ sucesso: false, mensagem: 'Não autorizado. Faça login para acessar esta funcionalidade.' });
  }
}

router.get('/historico-atendimentos', autenticar, historicoController.getHistoricos);

export default router; // ← permite import historicoRoute from ...
