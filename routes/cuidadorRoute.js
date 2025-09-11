import express from 'express';
import CuidadorController from '../controller/cuidadorController.js';

const router = express.Router();

router.get('/cuidador', CuidadorController.listar);
router.get('/cuidador/:id', CuidadorController.buscarPorId);
router.post('/cuidador', CuidadorController.criar);
router.put('/cuidador/:id', CuidadorController.atualizar);
router.delete('/cuidador/:id', CuidadorController.excluir);

export default router;
