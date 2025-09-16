import pool from '../config/db.js';

class AtendimentoModel {
    //lista os atendimento existentes
    static async listar() {
        const [rows] = await pool.query(`
            SELECT a.*, 
                   r.Nome AS NomeResponsavel, 
                   i.Nome AS NomeIdoso, 
                   c.Nome AS NomeCuidador
            FROM atendimento a
            LEFT JOIN responsavel r ON a.IdResponsavel = r.IdResponsavel
            LEFT JOIN idoso i ON a.IdIdoso = i.IdIdoso
            LEFT JOIN cuidador c ON a.IdCuidador = c.IdCuidador
        `);
        return rows;
    }
    //busca um atendimento especifico
    static async buscarPorId(id) {
        const [rows] = await pool.query('SELECT * FROM atendimento WHERE IdCuidador = ?', [id]);
        return rows[0];
    }

    //cancela um atendimento existente
    static async excluir(id) {
        await pool.query('DELETE FROM atendimento WHERE IdCuidador = ?', [id]);
        return { message: 'Cuidador removido com sucesso' };
    }
}

export default AtendimentoModel;
