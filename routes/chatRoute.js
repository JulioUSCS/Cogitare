// routes/chatRoute.js
import express from 'express';
import chatController from '../controllers/chatController.js';

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

// Rotas de suporte
router.post('/suporte/ticket', chatController.criarTicketSuporte);
router.get('/suporte/tickets/:id/:tipo', chatController.buscarTicketsUsuario);
router.get('/suporte/tickets', chatController.buscarTodosTickets);
router.get('/suporte/ticket/:id', chatController.buscarChatPorId);

// Rotas de mensagens de suporte
router.post('/suporte/mensagem', chatController.enviarMensagemSuporte);
router.get('/suporte/:id/mensagens', chatController.buscarMensagensChat);
router.put('/suporte/:id/marcar-lidas', chatController.marcarMensagensComoLidas);

// Rotas de categorias e estatísticas
router.get('/suporte/categorias', chatController.buscarCategoriasSuporte);
router.get('/suporte/estatisticas', chatController.buscarEstatisticasSuporte);
router.put('/suporte/ticket/:id/status', chatController.atualizarStatusTicket);

export default router;
