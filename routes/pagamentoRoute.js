import express from 'express';
import {
  getPagamentos,
  getPagamentoPorId,
  getPagamentosPorResponsavel,
  getPagamentosPorStatus,
  criarPagamento,
  atualizarPagamento,
  excluirPagamento
} from '../controllers/pagamentoController.js';

const router = express.Router();

router.get('/pagamentos', getPagamentos);
router.get('/pagamentos/:id', getPagamentoPorId);
router.get('/pagamentos/responsavel/:idResponsavel', getPagamentosPorResponsavel);
router.get('/pagamentos/status/:status', getPagamentosPorStatus);

router.post('/pagamentos', criarPagamento);
router.put('/pagamentos/:id', atualizarPagamento);
router.delete('/pagamentos/:id', excluirPagamento);

export default router;
