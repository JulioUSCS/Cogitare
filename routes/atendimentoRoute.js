import express from 'express';
import AtendimentoController from '../controllers/atendimentoController.js';


const router = express.Router();

router.get('/atendimento', AtendimentoController.listar);
router.get('/atendimento/:id', AtendimentoController.buscarPorId);
router.delete('/atendimento/:id', AtendimentoController.excluir);
router.put('/atendimento/:id/status', AtendimentoController.atualizarStatus);

export default router;
