import pool from '../config/db.js';

class AtendimentoModel {
    //lista os atendimento existentes
    static async listar() {
        const [result] = await pool.execute('CALL sp_atendimento_listar()');
        return result[0];
    }

    //busca um atendimento especifico
    static async buscarPorId(id) {
        const [result] = await pool.execute('CALL sp_atendimento_buscar_por_id(?)', [id]);
        return result[0] && result[0][0] ? result[0][0] : null;
    }

    //cria um novo atendimento
    static async criar(dados) {
        const IdAdministrador = dados.IdAdministrador || 1; // Default para admin principal se não fornecido
        const [result] = await pool.execute(
            'CALL sp_atendimento_criar(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [
                dados.IdResponsavel || null,
                dados.IdCuidador || null,
                dados.IdIdoso || null,
                dados.DataInicio || null,
                dados.DataFim || null,
                dados.Status || null,
                dados.Local || null,
                dados.Valor || null,
                dados.ObservacaoExtra || null,
                IdAdministrador
            ]
        );
        // SELECT LAST_INSERT_ID() AS Id -> fica em result[0][0].Id
        return result[0] && result[0][0] ? result[0][0].Id : null;
    }

    //atualiza todos os campos de um atendimento
    static async atualizar(id, dados) {
        const IdAdministrador = dados.IdAdministrador || 1; // Default para admin principal se não fornecido
        await pool.execute(
            'CALL sp_atendimento_atualizar(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [
                id,
                dados.IdResponsavel || null,
                dados.IdCuidador || null,
                dados.IdIdoso || null,
                dados.DataInicio || null,
                dados.DataFim || null,
                dados.Status || null,
                dados.Local || null,
                dados.Valor || null,
                dados.ObservacaoExtra || null,
                IdAdministrador
            ]
        );
    }

    //atualiza o status de um atendimento
    static async atualizarStatus(id, status, IdAdministrador = 1) {
        await pool.execute(
            'CALL sp_atendimento_atualizar_status(?, ?, ?)',
            [id, status, IdAdministrador]
        );
        
        return { 
            success: true, 
            message: `Status do atendimento atualizado para: ${status}`
        };
    }

    //cancela um atendimento existente
    static async excluir(id, IdAdministrador = 1) {
        await pool.execute('CALL sp_atendimento_excluir(?, ?)', [id, IdAdministrador]);
        return { message: 'Atendimento removido com sucesso' };
    }
}

export default AtendimentoModel;
