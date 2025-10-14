// routes/avaliacaoRoute.js
import express from 'express';
import avaliacaoController from '../controllers/avaliacaoController.js';

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

// Rotas de avaliações
router.post('/avaliacao', avaliacaoController.criarAvaliacao);
router.get('/avaliacao', avaliacaoController.buscarTodasAvaliacoes);
router.get('/avaliacao/estatisticas', avaliacaoController.buscarEstatisticas);
router.get('/avaliacao/cuidador/:id', avaliacaoController.buscarAvaliacoesPorCuidador);
router.get('/avaliacao/cuidador/:id/media', avaliacaoController.calcularMediaCuidador);
router.get('/avaliacao/responsavel/:id', avaliacaoController.buscarAvaliacoesPorResponsavel);
router.get('/avaliacao/atendimentos/:id', avaliacaoController.buscarAtendimentosParaAvaliacao);
router.put('/avaliacao/:id', avaliacaoController.atualizarAvaliacao);
router.delete('/avaliacao/:id', avaliacaoController.excluirAvaliacao);

export default router;
