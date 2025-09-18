import AtendimentoModel from '../model/atendimentoModel.js';

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
            const msg = await AtendimentoModel.excluir(req.params.id);
            res.json(msg);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
}


export default AtendimentoController;
