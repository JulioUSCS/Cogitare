import express from 'express';
import AtendimentoController from '../controller/atendimentoController.js';


const router = express.Router();

router.get('/atendimento', AtendimentoController.listar);
router.get('/atendimento/:id', AtendimentoController.buscarPorId);
router.delete('/atendimento/:id', AtendimentoController.excluir);

export default router;
