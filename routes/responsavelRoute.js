import express from 'express';
import responsavelController from '../controllers/responsavelController.js';

const router = express.Router();

// Rotas CRUD
router.get('/resp', responsavelController.listarTodos);
router.post('/resp', responsavelController.criar);
router.put('/resp/:id', responsavelController.atualizar);
router.delete('/resp/:id', responsavelController.excluir);

// Rota extra para popular select
router.get('/resp/select', responsavelController.listarParaSelect);

export default router;
