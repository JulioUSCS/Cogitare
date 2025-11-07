import pool from '../config/db.js';

const sanitizeValue = (value) => {
    if (value === undefined || value === '') {
        return null;
    }
    return value;
};

class CuidadorModel {
    static async listar() {
        const [result] = await pool.execute('CALL sp_cuidador_listar()');
        return result[0];
    }

    static async buscarPorId(id) {
        const [result] = await pool.execute('CALL sp_cuidador_buscar_por_id(?)', [id]);
        return result[0] && result[0][0] ? result[0][0] : null;
    }

    static async criar(cuidador) {
        const {
            IdEndereco,
            Cpf,
            Nome,
            Email,
            Telefone,
            Senha,
            DataNascimento,
            FotoUrl,
            Biografia,
            Fumante,
            TemFilhos,
            PossuiCNH,
            TemCarro,
            IdAdministrador
        } = cuidador;

        const adminId = IdAdministrador || 1;

        const params = [
            sanitizeValue(IdEndereco),
            sanitizeValue(Cpf),
            sanitizeValue(Nome),
            sanitizeValue(Email),
            sanitizeValue(Telefone),
            sanitizeValue(Senha),
            sanitizeValue(DataNascimento),
            sanitizeValue(FotoUrl),
            sanitizeValue(Biografia),
            sanitizeValue(Fumante) || 'Não',
            sanitizeValue(TemFilhos) || 'Não',
            sanitizeValue(PossuiCNH) || 'Não',
            sanitizeValue(TemCarro) || 'Não',
            adminId
        ];

        const [result] = await pool.execute(
            'CALL sp_cuidador_criar(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            params
        );
        const id = result[0] && result[0][0] ? result[0][0].Id : null;
        return { IdCuidador: id, ...cuidador };
    }

    static async atualizar(id, cuidador) {
        const atual = await this.buscarPorId(id);
        if (!atual) {
            throw new Error('Cuidador não encontrado');
        }

        const {
            IdEndereco,
            Cpf,
            Nome,
            Email,
            Telefone,
            Senha,
            DataNascimento,
            FotoUrl,
            Biografia,
            Fumante,
            TemFilhos,
            PossuiCNH,
            TemCarro,
            IdAdministrador
        } = cuidador;

        const adminId = IdAdministrador || 1;

        const resolveValor = (novo, antigo, padrao = null) => {
            if (novo === undefined) return antigo ?? padrao;
            if (novo === '') return padrao;
            return novo;
        };

        const params = [
            id,
            resolveValor(IdEndereco, atual.IdEndereco),
            resolveValor(Cpf, atual.Cpf),
            resolveValor(Nome, atual.Nome),
            resolveValor(Email, atual.Email),
            resolveValor(Telefone, atual.Telefone),
            resolveValor(Senha, atual.Senha),
            resolveValor(DataNascimento, atual.DataNascimento),
            resolveValor(FotoUrl, atual.FotoUrl),
            resolveValor(Biografia, atual.Biografia),
            resolveValor(Fumante, atual.Fumante, 'Não'),
            resolveValor(TemFilhos, atual.TemFilhos, 'Não'),
            resolveValor(PossuiCNH, atual.PossuiCNH, 'Não'),
            resolveValor(TemCarro, atual.TemCarro, 'Não'),
            adminId
        ].map(sanitizeValue);

        // As flags (fumante, temFilhos, possuiCNH, temCarro) devem ser 'Sim' ou 'Não'
        params[10] = params[10] || 'Não';
        params[11] = params[11] || 'Não';
        params[12] = params[12] || 'Não';
        params[13] = params[13] || 'Não';

        await pool.execute(
            'CALL sp_cuidador_atualizar(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            params
        );
        return { IdCuidador: id, ...cuidador };
    }

    static async excluir(id, IdAdministrador = 1) {
        await pool.execute('CALL sp_cuidador_excluir(?, ?)', [id, IdAdministrador]);
        return { message: 'Cuidador e todos os registros relacionados foram removidos com sucesso' };
    }
}

export default CuidadorModel;
