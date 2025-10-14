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
        const [rows] = await pool.query('SELECT * FROM atendimento WHERE IdAtendimento = ?', [id]);
        return rows[0];
    }

    //cancela um atendimento existente
    static async excluir(id) {
        await pool.query('DELETE FROM atendimento WHERE IdAtendimento = ?', [id]);
        return { message: 'Atendimento removido com sucesso' };
    }

    //atualiza o status de um atendimento
    static async atualizarStatus(id, status) {
        const [result] = await pool.query(
            'UPDATE atendimento SET Status = ? WHERE IdAtendimento = ?', 
            [status, id]
        );
        
        if (result.affectedRows === 0) {
            throw new Error('Atendimento não encontrado');
        }
        
        return { 
            success: true, 
            message: `Status do atendimento atualizado para: ${status}`,
            affectedRows: result.affectedRows
        };
    }
}

export default AtendimentoModel;
