import AtendimentoModel from '../models/atendimentoModel.js';
import financeiroModel from '../models/financeiroModel.js';
import PagamentoModel from '../models/pagamentoModel.js';

class AtendimentoController {
    static async listar(req, res) {
        try {
            const atendimentos = await AtendimentoModel.listar();
            res.json({ success: true, data: atendimentos });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }

    static async buscarPorId(req, res) {
        try {
            const atendimento = await AtendimentoModel.buscarPorId(req.params.id);
            if (!atendimento) return res.status(404).json({ error: 'Atendimento não encontrado' });
            res.json(atendimento);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    static async excluir(req, res) {
        try {
            const IdAdministrador = req.session.usuario?.id || 1;
            const msg = await AtendimentoModel.excluir(req.params.id, IdAdministrador);
            res.json(msg);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    static async atualizarStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const IdAdministrador = req.session.usuario?.id || 1;

            if (!status) {
                return res.status(400).json({
                    success: false,
                    message: 'Status é obrigatório'
                });
            }

            // Atualizar status do atendimento
            const resultado = await AtendimentoModel.atualizarStatus(id, status, IdAdministrador);

            // Se o status for "Concluído", criar receita e pagamento automaticamente
            if (status === 'Concluído') {
                try {
                    // Criar receita automaticamente
                    const receitaResult = await financeiroModel.criarReceitaAutomatica(id);
                    if (receitaResult.success) {
                        resultado.receitaCriada = true;
                        resultado.receitaMessage = receitaResult.message;
                    } else {
                        resultado.receitaCriada = false;
                        resultado.receitaMessage = receitaResult.message;
                    }
                } catch (receitaError) {
                    console.warn('Erro ao criar receita automática:', receitaError);
                    resultado.receitaCriada = false;
                    resultado.receitaMessage = 'Erro ao criar receita automática';
                }

                try {
                    // Criar pagamento automaticamente
                    const pagamentoResult = await PagamentoModel.criarPagamentoAutomatico(id);
                    if (pagamentoResult.success) {
                        resultado.pagamentoCriado = true;
                        resultado.pagamentoMessage = pagamentoResult.message;
                    } else {
                        resultado.pagamentoCriado = false;
                        resultado.pagamentoMessage = pagamentoResult.message;
                    }
                } catch (pagamentoError) {
                    console.warn('Erro ao criar pagamento automático:', pagamentoError);
                    resultado.pagamentoCriado = false;
                    resultado.pagamentoMessage = 'Erro ao criar pagamento automático';
                }
            }

            res.json(resultado);
        } catch (err) {
            res.status(500).json({ 
                success: false, 
                message: err.message 
            });
        }
    }
}


export default AtendimentoController;
