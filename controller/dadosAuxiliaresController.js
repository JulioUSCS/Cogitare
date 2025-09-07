const Idoso = require('../model/idosoModel');

const dadosAuxiliaresController = {
    async listarMobilidades(req, res) {
        try {
            const mobilidades = await Idoso.listarMobilidade();
            res.json({ sucesso: true, mobilidades: mobilidades });
        } catch (error) {
            console.error('Erro ao listar mobilidades:', error);
            res.status(500).json({ sucesso: false, mensagem: 'Erro ao buscar mobilidades' });
        }
    },

    async listarNiveis(req, res) {
        try {
            const niveis = await Idoso.listarNivelAutonomia();
            res.json({ sucesso: true, niveis: niveis });
        } catch (error) {
            console.error('Erro ao listar níveis de autonomia:', error);
            res.status(500).json({ sucesso: false, mensagem: 'Erro ao buscar níveis de autonomia' });
        }
    },

    async listarResponsaveis(req, res) {
        try {
            const responsaveis = await Idoso.listarResponsavel();
            res.json({ sucesso: true, responsaveis: responsaveis });
        } catch (error) {
            console.error('Erro ao listar responsáveis:', error);
            res.status(500).json({ sucesso: false, mensagem: 'Erro ao buscar responsáveis' });
        }
    }
};

export default dadosAuxiliaresController;
