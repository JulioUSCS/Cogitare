import express from 'express';
import { 
  getPagamentos, 
  getPagamentoPorId, 
  getPagamentosPorResponsavel, 
  getPagamentosPorStatus 
} from '../controller/pagamentoController.js';

const router = express.Router();

// Rota para buscar todos os pagamentos
router.get('/pagamentos', getPagamentos);

// Rota para buscar um pagamento específico por ID
router.get('/pagamentos/:id', getPagamentoPorId);

// Rota para buscar pagamentos por responsável
router.get('/pagamentos/responsavel/:idResponsavel', getPagamentosPorResponsavel);

// Rota para buscar pagamentos por status
router.get('/pagamentos/status/:status', getPagamentosPorStatus);

export default router;
