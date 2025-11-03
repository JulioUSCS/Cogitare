import pool from '../config/db.js';

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
        const { IdEndereco, Cpf, Nome, Email, Telefone, Senha, DataNascimento, FotoUrl, Biografia, Fumante, TemFilhos, PossuiCNH, TemCarro, IdAdministrador } = cuidador;
        const adminId = IdAdministrador || 1;
        
        const [result] = await pool.execute(
            'CALL sp_cuidador_criar(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [IdEndereco, Cpf, Nome, Email, Telefone, Senha, DataNascimento, FotoUrl, Biografia, Fumante, TemFilhos, PossuiCNH, TemCarro, adminId]
        );
        const id = result[0] && result[0][0] ? result[0][0].Id : null;
        return { IdCuidador: id, ...cuidador };
    }

    static async atualizar(id, cuidador) {
        const { IdEndereco, Cpf, Nome, Email, Telefone, Senha, DataNascimento, FotoUrl, Biografia, Fumante, TemFilhos, PossuiCNH, TemCarro, IdAdministrador } = cuidador;
        const adminId = IdAdministrador || 1;
        
        await pool.execute(
            'CALL sp_cuidador_atualizar(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [id, IdEndereco, Cpf, Nome, Email, Telefone, Senha, DataNascimento, FotoUrl, Biografia, Fumante, TemFilhos, PossuiCNH, TemCarro, adminId]
        );
        return { IdCuidador: id, ...cuidador };
    }

    static async excluir(id, IdAdministrador = 1) {
        await pool.execute('CALL sp_cuidador_excluir(?, ?)', [id, IdAdministrador]);
        return { message: 'Cuidador e todos os registros relacionados foram removidos com sucesso' };
    }
}

export default CuidadorModel;
