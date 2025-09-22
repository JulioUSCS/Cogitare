// routes/financeiroRoute.js
import express from 'express';
import financeiroController from '../controller/financeiroController.js';

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

// ========== ROTAS DE RECEITAS ==========
router.post('/financeiro/receita', financeiroController.criarReceita);
router.get('/financeiro/receitas', financeiroController.buscarReceitasPorPeriodo);

// ========== ROTAS DE DESPESAS ==========
router.post('/financeiro/despesa', financeiroController.criarDespesa);
router.get('/financeiro/despesas', financeiroController.buscarDespesasPorPeriodo);

// ========== ROTAS DE COMISSÕES ==========
router.post('/financeiro/comissao', financeiroController.calcularComissao);
router.get('/financeiro/comissoes', financeiroController.buscarComissoesPorPeriodo);

// ========== ROTAS DE INADIMPLÊNCIA ==========
router.get('/financeiro/inadimplencia', financeiroController.verificarInadimplencia);
router.get('/financeiro/inadimplencia-periodo', financeiroController.buscarInadimplenciaPorPeriodo);

// ========== ROTAS DO DASHBOARD FINANCEIRO ==========
router.get('/financeiro/estatisticas', financeiroController.buscarEstatisticasFinanceiras);
router.get('/financeiro/receitas-mes', financeiroController.buscarReceitasPorMes);
router.get('/financeiro/despesas-categoria', financeiroController.buscarDespesasPorCategoria);
router.get('/financeiro/cuidadores-rentaveis', financeiroController.buscarCuidadoresMaisRentaveis);

// ========== ROTAS DE METAS FINANCEIRAS ==========
router.get('/financeiro/metas', financeiroController.buscarMetasFinanceiras);
router.put('/financeiro/metas/atualizar', financeiroController.atualizarProgressoMetas);

// ========== ROTAS DE AUTOMAÇÃO ==========
router.post('/financeiro/receita-automatica', financeiroController.criarReceitaAutomatica);

export default router;
