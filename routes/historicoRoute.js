import express from 'express';
import { 
    getHistorico, 
    getHistoricoPorId, 
    getHistoricoPorResponsavel, 
    getHistoricoPorCuidador,
    getHistoricoPorAdministrador,
    getHistoricoPorAcao,
    getHistoricoAtendimento
} from '../controllers/historicoController.js';

const router = express.Router();

// Rota para buscar todo o histórico
router.get('/historico', getHistorico);

// Rota específica para histórico de atendimentos
router.get('/historico/atendimento', getHistoricoAtendimento);

// Rota para buscar todos os históricos de responsáveis
router.get('/historico/responsavel', getHistoricoPorResponsavel);
// Rota para buscar histórico por responsável específico
router.get('/historico/responsavel/:idResponsavel', getHistoricoPorResponsavel);

// Rota para buscar todos os históricos de cuidadores
router.get('/historico/cuidador', getHistoricoPorCuidador);
// Rota para buscar histórico por cuidador específico
router.get('/historico/cuidador/:idCuidador', getHistoricoPorCuidador);

// Rota para buscar todos os históricos de administradores
router.get('/historico/administrador', getHistoricoPorAdministrador);
// Rota para buscar histórico por administrador específico
router.get('/historico/administrador/:idAdministrador', getHistoricoPorAdministrador);

// Rota para buscar histórico por operação
router.get('/historico/operacao/:operacao', getHistoricoPorAcao);

// Rota para buscar um registro específico por ID (deve ser a última)
router.get('/historico/:id', getHistoricoPorId);

export default router;