import pool from '../config/db.js';

class HistoricoModel {
    // Lista todo o histórico unificado das 4 tabelas
    static async listar() {
      const [rows] = await pool.query(`
            -- Histórico de Atendimentos
            SELECT 
                ha.IdHistorico,
                'Atendimento' as TipoHistorico,
                ha.StatusFinal as Operacao,
                ha.DataRegistro as DataHora,
                ha.Observacoes,
                r.Nome as NomeResponsavel,
                r.Email as EmailResponsavel,
                c.Nome as NomeCuidador,
                c.Email as EmailCuidador,
                NULL as NomeAdministrador,
                NULL as EmailAdministrador,
                a.IdAtendimento,
                i.Nome as NomeIdoso
            FROM historicoatendimento ha
            LEFT JOIN atendimento a ON ha.IdAtendimento = a.IdAtendimento
            LEFT JOIN responsavel r ON a.IdResponsavel = r.IdResponsavel
            LEFT JOIN cuidador c ON a.IdCuidador = c.IdCuidador
            LEFT JOIN idoso i ON a.IdIdoso = i.IdIdoso
            
            UNION ALL
            
            -- Histórico de Administradores
            SELECT 
                had.IdHistoricoAdm as IdHistorico,
                'Administrador' as TipoHistorico,
                had.Operacao,
                had.DataOperacao as DataHora,
                NULL as Observacoes,
                NULL as NomeResponsavel,
                NULL as EmailResponsavel,
                NULL as NomeCuidador,
                NULL as EmailCuidador,
                ad.Usuario as NomeAdministrador,
                NULL as EmailAdministrador,
                NULL as IdAtendimento,
                NULL as NomeIdoso
            FROM historicoadministrador had
            LEFT JOIN administrador ad ON had.IdAdministrador = ad.IdAdministrador
            
            UNION ALL
            
            -- Histórico de Cuidadores
            SELECT 
                hc.IdHistoricoCuidador as IdHistorico,
                'Cuidador' as TipoHistorico,
                hc.Operacao,
                hc.DataOperacao as DataHora,
                NULL as Observacoes,
                NULL as NomeResponsavel,
                NULL as EmailResponsavel,
                c.Nome as NomeCuidador,
                c.Email as EmailCuidador,
                NULL as NomeAdministrador,
                NULL as EmailAdministrador,
                NULL as IdAtendimento,
                NULL as NomeIdoso
            FROM historicocuidador hc
            LEFT JOIN cuidador c ON hc.IdCuidador = c.IdCuidador
            
            UNION ALL
            
            -- Histórico de Responsáveis
        SELECT
                hr.IdHistoricoResponsavel as IdHistorico,
                'Responsavel' as TipoHistorico,
                hr.Operacao,
                hr.DataOperacao as DataHora,
                NULL as Observacoes,
                r.Nome as NomeResponsavel,
                r.Email as EmailResponsavel,
                NULL as NomeCuidador,
                NULL as EmailCuidador,
                NULL as NomeAdministrador,
                NULL as EmailAdministrador,
                NULL as IdAtendimento,
                NULL as NomeIdoso
            FROM historicoresponsavel hr
            LEFT JOIN responsavel r ON hr.IdResponsavel = r.IdResponsavel
            
            ORDER BY DataHora DESC
      `);
      return rows;
    }

    // Busca histórico por ID (busca em todas as tabelas)
    static async buscarPorId(id) {
        const [rows] = await pool.query(`
            -- Histórico de Atendimentos
            SELECT 
                ha.IdHistorico,
                'Atendimento' as TipoHistorico,
                ha.StatusFinal as Operacao,
                ha.DataRegistro as DataHora,
                ha.Observacoes,
                r.Nome as NomeResponsavel,
                r.Email as EmailResponsavel,
                c.Nome as NomeCuidador,
                c.Email as EmailCuidador,
                NULL as NomeAdministrador,
                NULL as EmailAdministrador,
                a.IdAtendimento,
                i.Nome as NomeIdoso
            FROM historicoatendimento ha
            LEFT JOIN atendimento a ON ha.IdAtendimento = a.IdAtendimento
            LEFT JOIN responsavel r ON a.IdResponsavel = r.IdResponsavel
            LEFT JOIN cuidador c ON a.IdCuidador = c.IdCuidador
            LEFT JOIN idoso i ON a.IdIdoso = i.IdIdoso
            WHERE ha.IdHistorico = ?
            
            UNION ALL
            
            -- Histórico de Administradores
            SELECT 
                had.IdHistoricoAdm as IdHistorico,
                'Administrador' as TipoHistorico,
                had.Operacao,
                had.DataOperacao as DataHora,
                NULL as Observacoes,
                NULL as NomeResponsavel,
                NULL as EmailResponsavel,
                NULL as NomeCuidador,
                NULL as EmailCuidador,
                ad.Usuario as NomeAdministrador,
                NULL as EmailAdministrador,
                NULL as IdAtendimento,
                NULL as NomeIdoso
            FROM historicoadministrador had
            LEFT JOIN administrador ad ON had.IdAdministrador = ad.IdAdministrador
            WHERE had.IdHistoricoAdm = ?
            
            UNION ALL
            
            -- Histórico de Cuidadores
            SELECT 
                hc.IdHistoricoCuidador as IdHistorico,
                'Cuidador' as TipoHistorico,
                hc.Operacao,
                hc.DataOperacao as DataHora,
                NULL as Observacoes,
                NULL as NomeResponsavel,
                NULL as EmailResponsavel,
                c.Nome as NomeCuidador,
                c.Email as EmailCuidador,
                NULL as NomeAdministrador,
                NULL as EmailAdministrador,
                NULL as IdAtendimento,
                NULL as NomeIdoso
            FROM historicocuidador hc
            LEFT JOIN cuidador c ON hc.IdCuidador = c.IdCuidador
            WHERE hc.IdHistoricoCuidador = ?
            
            UNION ALL
            
            -- Histórico de Responsáveis
            SELECT 
                hr.IdHistoricoResponsavel as IdHistorico,
                'Responsavel' as TipoHistorico,
                hr.Operacao,
                hr.DataOperacao as DataHora,
                NULL as Observacoes,
                r.Nome as NomeResponsavel,
                r.Email as EmailResponsavel,
                NULL as NomeCuidador,
                NULL as EmailCuidador,
                NULL as NomeAdministrador,
                NULL as EmailAdministrador,
                NULL as IdAtendimento,
                NULL as NomeIdoso
            FROM historicoresponsavel hr
            LEFT JOIN responsavel r ON hr.IdResponsavel = r.IdResponsavel
            WHERE hr.IdHistoricoResponsavel = ?
        `, [id, id, id, id]);
        return rows[0];
    }

    // Busca histórico por responsável
    static async buscarPorResponsavel(idResponsavel) {
        const [rows] = await pool.query(`
            -- Histórico de Atendimentos do Responsável
            SELECT 
                ha.IdHistorico,
                'Atendimento' as TipoHistorico,
                ha.StatusFinal as Operacao,
                ha.DataRegistro as DataHora,
                ha.Observacoes,
                r.Nome as NomeResponsavel,
                r.Email as EmailResponsavel,
                c.Nome as NomeCuidador,
                c.Email as EmailCuidador,
                NULL as NomeAdministrador,
                NULL as EmailAdministrador,
                a.IdAtendimento,
                i.Nome as NomeIdoso
            FROM historicoatendimento ha
            LEFT JOIN atendimento a ON ha.IdAtendimento = a.IdAtendimento
            LEFT JOIN responsavel r ON a.IdResponsavel = r.IdResponsavel
            LEFT JOIN cuidador c ON a.IdCuidador = c.IdCuidador
            LEFT JOIN idoso i ON a.IdIdoso = i.IdIdoso
            WHERE a.IdResponsavel = ?
            
            UNION ALL
            
            -- Histórico de Responsável
            SELECT 
                hr.IdHistoricoResponsavel as IdHistorico,
                'Responsavel' as TipoHistorico,
                hr.Operacao,
                hr.DataOperacao as DataHora,
                NULL as Observacoes,
                r.Nome as NomeResponsavel,
                r.Email as EmailResponsavel,
                NULL as NomeCuidador,
                NULL as EmailCuidador,
                NULL as NomeAdministrador,
                NULL as EmailAdministrador,
                NULL as IdAtendimento,
                NULL as NomeIdoso
            FROM historicoresponsavel hr
            LEFT JOIN responsavel r ON hr.IdResponsavel = r.IdResponsavel
            WHERE hr.IdResponsavel = ?
            
            ORDER BY DataHora DESC
        `, [idResponsavel, idResponsavel]);
        return rows;
    }

    // Busca histórico por cuidador
    static async buscarPorCuidador(idCuidador) {
        const [rows] = await pool.query(`
            -- Histórico de Atendimentos do Cuidador
            SELECT 
                ha.IdHistorico,
                'Atendimento' as TipoHistorico,
                ha.StatusFinal as Operacao,
                ha.DataRegistro as DataHora,
                ha.Observacoes,
                r.Nome as NomeResponsavel,
                r.Email as EmailResponsavel,
                c.Nome as NomeCuidador,
                c.Email as EmailCuidador,
                NULL as NomeAdministrador,
                NULL as EmailAdministrador,
                a.IdAtendimento,
                i.Nome as NomeIdoso
            FROM historicoatendimento ha
            LEFT JOIN atendimento a ON ha.IdAtendimento = a.IdAtendimento
            LEFT JOIN responsavel r ON a.IdResponsavel = r.IdResponsavel
            LEFT JOIN cuidador c ON a.IdCuidador = c.IdCuidador
            LEFT JOIN idoso i ON a.IdIdoso = i.IdIdoso
            WHERE a.IdCuidador = ?
            
            UNION ALL
            
            -- Histórico de Cuidador
            SELECT 
                hc.IdHistoricoCuidador as IdHistorico,
                'Cuidador' as TipoHistorico,
                hc.Operacao,
                hc.DataOperacao as DataHora,
                NULL as Observacoes,
                NULL as NomeResponsavel,
                NULL as EmailResponsavel,
                c.Nome as NomeCuidador,
                c.Email as EmailCuidador,
                NULL as NomeAdministrador,
                NULL as EmailAdministrador,
                NULL as IdAtendimento,
                NULL as NomeIdoso
            FROM historicocuidador hc
            LEFT JOIN cuidador c ON hc.IdCuidador = c.IdCuidador
            WHERE hc.IdCuidador = ?
            
            ORDER BY DataHora DESC
        `, [idCuidador, idCuidador]);
        return rows;
    }

    // Busca histórico por administrador
    static async buscarPorAdministrador(idAdministrador) {
        const [rows] = await pool.query(`
            SELECT 
                had.IdHistoricoAdm as IdHistorico,
                'Administrador' as TipoHistorico,
                had.Operacao,
                had.DataOperacao as DataHora,
                NULL as Observacoes,
                NULL as NomeResponsavel,
                NULL as EmailResponsavel,
                NULL as NomeCuidador,
                NULL as EmailCuidador,
                ad.Usuario as NomeAdministrador,
                NULL as EmailAdministrador,
                NULL as IdAtendimento,
                NULL as NomeIdoso
            FROM historicoadministrador had
            LEFT JOIN administrador ad ON had.IdAdministrador = ad.IdAdministrador
            WHERE had.IdAdministrador = ?
            ORDER BY had.DataOperacao DESC
        `, [idAdministrador]);
        return rows;
    }

    // Busca histórico por operação
    static async buscarPorOperacao(operacao) {
        const [rows] = await pool.query(`
            -- Histórico de Atendimentos
            SELECT 
                ha.IdHistorico,
                'Atendimento' as TipoHistorico,
                ha.StatusFinal as Operacao,
                ha.DataRegistro as DataHora,
                ha.Observacoes,
                r.Nome as NomeResponsavel,
                r.Email as EmailResponsavel,
                c.Nome as NomeCuidador,
                c.Email as EmailCuidador,
                NULL as NomeAdministrador,
                NULL as EmailAdministrador,
                a.IdAtendimento,
                i.Nome as NomeIdoso
            FROM historicoatendimento ha
            LEFT JOIN atendimento a ON ha.IdAtendimento = a.IdAtendimento
            LEFT JOIN responsavel r ON a.IdResponsavel = r.IdResponsavel
            LEFT JOIN cuidador c ON a.IdCuidador = c.IdCuidador
            LEFT JOIN idoso i ON a.IdIdoso = i.IdIdoso
            WHERE ha.StatusFinal LIKE ?
            
            UNION ALL
            
            -- Histórico de Administradores
            SELECT 
                had.IdHistoricoAdm as IdHistorico,
                'Administrador' as TipoHistorico,
                had.Operacao,
                had.DataOperacao as DataHora,
                NULL as Observacoes,
                NULL as NomeResponsavel,
                NULL as EmailResponsavel,
                NULL as NomeCuidador,
                NULL as EmailCuidador,
                ad.Usuario as NomeAdministrador,
                NULL as EmailAdministrador,
                NULL as IdAtendimento,
                NULL as NomeIdoso
            FROM historicoadministrador had
            LEFT JOIN administrador ad ON had.IdAdministrador = ad.IdAdministrador
            WHERE had.Operacao LIKE ?
            
            UNION ALL
            
            -- Histórico de Cuidadores
            SELECT 
                hc.IdHistoricoCuidador as IdHistorico,
                'Cuidador' as TipoHistorico,
                hc.Operacao,
                hc.DataOperacao as DataHora,
                NULL as Observacoes,
                NULL as NomeResponsavel,
                NULL as EmailResponsavel,
                c.Nome as NomeCuidador,
                c.Email as EmailCuidador,
                NULL as NomeAdministrador,
                NULL as EmailAdministrador,
                NULL as IdAtendimento,
                NULL as NomeIdoso
            FROM historicocuidador hc
            LEFT JOIN cuidador c ON hc.IdCuidador = c.IdCuidador
            WHERE hc.Operacao LIKE ?
            
            UNION ALL
            
            -- Histórico de Responsáveis
            SELECT 
                hr.IdHistoricoResponsavel as IdHistorico,
                'Responsavel' as TipoHistorico,
                hr.Operacao,
                hr.DataOperacao as DataHora,
                NULL as Observacoes,
                r.Nome as NomeResponsavel,
                r.Email as EmailResponsavel,
                NULL as NomeCuidador,
                NULL as EmailCuidador,
                NULL as NomeAdministrador,
                NULL as EmailAdministrador,
                NULL as IdAtendimento,
                NULL as NomeIdoso
            FROM historicoresponsavel hr
            LEFT JOIN responsavel r ON hr.IdResponsavel = r.IdResponsavel
            WHERE hr.Operacao LIKE ?
            
            ORDER BY DataHora DESC
        `, [`%${operacao}%`, `%${operacao}%`, `%${operacao}%`, `%${operacao}%`]);
        return rows;
    }

    // Cria novo registro no histórico de atendimento
    static async criarHistoricoAtendimento(dados) {
        const { IdAtendimento, StatusFinal, Observacoes } = dados;
        const [result] = await pool.query(`
            INSERT INTO historicoatendimento (IdAtendimento, StatusFinal, Observacoes)
            VALUES (?, ?, ?)
        `, [IdAtendimento, StatusFinal, Observacoes]);
        return result.insertId;
    }

    // Cria novo registro no histórico de administrador
    static async criarHistoricoAdministrador(dados) {
        const { IdAdministrador, Operacao } = dados;
        const [result] = await pool.query(`
            INSERT INTO historicoadministrador (IdAdministrador, Operacao)
            VALUES (?, ?)
        `, [IdAdministrador, Operacao]);
        return result.insertId;
    }

    // Cria novo registro no histórico de cuidador
    static async criarHistoricoCuidador(dados) {
        const { IdCuidador, Operacao } = dados;
        const [result] = await pool.query(`
            INSERT INTO historicocuidador (IdCuidador, Operacao)
            VALUES (?, ?)
        `, [IdCuidador, Operacao]);
        return result.insertId;
    }

    // Cria novo registro no histórico de responsável
    static async criarHistoricoResponsavel(dados) {
        const { IdResponsavel, Operacao } = dados;
        const [result] = await pool.query(`
            INSERT INTO historicoresponsavel (IdResponsavel, Operacao)
            VALUES (?, ?)
        `, [IdResponsavel, Operacao]);
        return result.insertId;
    }

    // Busca apenas histórico de atendimentos
    static async buscarHistoricoAtendimento() {
        const [rows] = await pool.query(`
            SELECT 
                ha.IdHistorico,
                'Atendimento' as TipoHistorico,
                ha.StatusFinal as Operacao,
                ha.DataRegistro as DataHora,
                ha.Observacoes,
                r.Nome as NomeResponsavel,
                r.Email as EmailResponsavel,
                c.Nome as NomeCuidador,
                c.Email as EmailCuidador,
                NULL as NomeAdministrador,
                NULL as EmailAdministrador,
                a.IdAtendimento,
                i.Nome as NomeIdoso
            FROM historicoatendimento ha
            LEFT JOIN atendimento a ON ha.IdAtendimento = a.IdAtendimento
            LEFT JOIN responsavel r ON a.IdResponsavel = r.IdResponsavel
            LEFT JOIN cuidador c ON a.IdCuidador = c.IdCuidador
            LEFT JOIN idoso i ON a.IdIdoso = i.IdIdoso
            ORDER BY ha.DataRegistro DESC
        `);
        return rows;
    }

    // Busca todos os históricos de administradores
    static async buscarTodosAdministradores() {
        const [rows] = await pool.query(`
            SELECT 
                had.IdHistoricoAdm as IdHistorico,
                'Administrador' as TipoHistorico,
                had.Operacao,
                had.DataOperacao as DataHora,
                NULL as Observacoes,
                NULL as NomeResponsavel,
                NULL as EmailResponsavel,
                NULL as NomeCuidador,
                NULL as EmailCuidador,
                ad.Usuario as NomeAdministrador,
                NULL as EmailAdministrador,
                NULL as IdAtendimento,
                NULL as NomeIdoso
            FROM historicoadministrador had
            LEFT JOIN administrador ad ON had.IdAdministrador = ad.IdAdministrador
            ORDER BY had.DataOperacao DESC
        `);
        return rows;
    }

    // Busca todos os históricos de cuidadores
    static async buscarTodosCuidadores() {
        const [rows] = await pool.query(`
            SELECT 
                hc.IdHistoricoCuidador as IdHistorico,
                'Cuidador' as TipoHistorico,
                hc.Operacao,
                hc.DataOperacao as DataHora,
                NULL as Observacoes,
                NULL as NomeResponsavel,
                NULL as EmailResponsavel,
                c.Nome as NomeCuidador,
                c.Email as EmailCuidador,
                NULL as NomeAdministrador,
                NULL as EmailAdministrador,
                NULL as IdAtendimento,
                NULL as NomeIdoso
            FROM historicocuidador hc
            LEFT JOIN cuidador c ON hc.IdCuidador = c.IdCuidador
            ORDER BY hc.DataOperacao DESC
        `);
        return rows;
    }

    // Busca todos os históricos de responsáveis
    static async buscarTodosResponsaveis() {
        const [rows] = await pool.query(`
            SELECT 
                hr.IdHistoricoResponsavel as IdHistorico,
                'Responsavel' as TipoHistorico,
                hr.Operacao,
                hr.DataOperacao as DataHora,
                NULL as Observacoes,
                r.Nome as NomeResponsavel,
                r.Email as EmailResponsavel,
                NULL as NomeCuidador,
                NULL as EmailCuidador,
                NULL as NomeAdministrador,
                NULL as EmailAdministrador,
                NULL as IdAtendimento,
                NULL as NomeIdoso
            FROM historicoresponsavel hr
            LEFT JOIN responsavel r ON hr.IdResponsavel = r.IdResponsavel
            ORDER BY hr.DataOperacao DESC
        `);
        return rows;
    }
}

export default HistoricoModel;