// routes/dashboardRoute.js
import express from 'express';
import dashboardController from '../controllers/dashboardController.js';

const router = express.Router();

// Middleware para verificar se o usuário está logado
const verificarLogin = (req, res, next) => {
    if (req.session && req.session.usuario) {
        next();
    } else {
        res.status(401).json({
            success: false,
            message: 'Usuário não autenticado'
        });
    }
};

// Aplicar middleware de autenticação em todas as rotas
router.use(verificarLogin);

// Rotas do dashboard
router.get('/dashboard/metricas', dashboardController.buscarMetricasCompletas);
router.get('/dashboard/estatisticas-gerais', dashboardController.buscarEstatisticasGerais);
router.get('/dashboard/estatisticas-financeiras', dashboardController.buscarEstatisticasFinanceiras);
router.get('/dashboard/graficos/:tipo', dashboardController.buscarDadosGraficos);
router.get('/dashboard/cuidadores-ativos', dashboardController.buscarCuidadoresMaisAtivos);
router.get('/dashboard/crescimento', dashboardController.buscarDadosCrescimento);

export default router;
