// routes/responsavelRoute.js
import express from 'express';
import responsavelController from '../controller/responsavelController.js';

const router = express.Router();

// Rotas CRUD
router.get('/responsaveis', responsavelController.listar);
router.post('/responsaveis', responsavelController.criar);
router.put('/responsaveis/:id', responsavelController.atualizar);
router.delete('/responsaveis/:id', responsavelController.excluir);

export default router;
