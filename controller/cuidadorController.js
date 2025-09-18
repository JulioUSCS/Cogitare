import CuidadorModel from '../model/cuidadorModel.js';

class CuidadorController {
    static async listar(req, res) {
        try {
            const cuidadores = await CuidadorModel.listar();
            res.json({ success: true, data: cuidadores });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }

    static async buscarPorId(req, res) {
        try {
            const cuidador = await CuidadorModel.buscarPorId(req.params.id);
            if (!cuidador) return res.status(404).json({ error: 'Cuidador não encontrado' });
            res.json(cuidador);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    static async criar(req, res) {
        try {
            const novo = await CuidadorModel.criar(req.body);
            res.status(201).json(novo);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    static async atualizar(req, res) {
        try {
            const atualizado = await CuidadorModel.atualizar(req.params.id, req.body);
            res.json(atualizado);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    static async excluir(req, res) {
        try {
            const msg = await CuidadorModel.excluir(req.params.id);
            res.json(msg);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
}

export default CuidadorController;
