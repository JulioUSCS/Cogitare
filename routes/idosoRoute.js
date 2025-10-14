// routes/idosoRoute.js
import express from 'express';
import idososController from '../controllers/idososController.js';

const router = express.Router();

// Middleware de autenticação
function autenticar(req, res, next) {
  if (req.session.usuario) {
    return next();
  }
  res.status(401).json({ mensagem: 'Não autorizado' });
}

// Rotas CRUD
router.get('/idosos', autenticar, idososController.listar);
router.post('/idosos', autenticar, idososController.criar);
router.put('/idosos/:id', autenticar, idososController.atualizar);
router.delete('/idosos/:id', autenticar, idososController.excluir);

// Rotas auxiliares
router.get('/mobilidades', autenticar, idososController.listarMobilidade);
router.get('/niveis-autonomia', autenticar, idososController.listarNivelAutonomia);
router.get('/responsaveis', autenticar, idososController.listarResponsavel);  

export default router; // ← permite importar como "import idososRoute from ..."
