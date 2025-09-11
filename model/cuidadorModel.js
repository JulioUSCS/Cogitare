import pool from '../config/db.js';

class CuidadorModel {
    static async listar() {
        const [rows] = await pool.query('SELECT * FROM cuidador');
        return rows;
    }

    static async buscarPorId(id) {
        const [rows] = await pool.query('SELECT * FROM cuidador WHERE IdCuidador = ?', [id]);
        return rows[0];
    }

    static async criar(cuidador) {
        const { IdEndereco, Cpf, Nome, Email, Telefone, Senha, DataNascimento, FotoUrl, Biografia, Fumante, TemFilhos, PossuiCNH, TemCarro } = cuidador;
        const [result] = await pool.query(
            `INSERT INTO cuidador 
            (IdEndereco, Cpf, Nome, Email, Telefone, Senha, DataNascimento, FotoUrl, Biografia, Fumante, TemFilhos, PossuiCNH, TemCarro) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [IdEndereco, Cpf, Nome, Email, Telefone, Senha, DataNascimento, FotoUrl, Biografia, Fumante, TemFilhos, PossuiCNH, TemCarro]
        );
        return { IdCuidador: result.insertId, ...cuidador };
    }

    static async atualizar(id, cuidador) {
        const { IdEndereco, Cpf, Nome, Email, Telefone, Senha, DataNascimento, FotoUrl, Biografia, Fumante, TemFilhos, PossuiCNH, TemCarro } = cuidador;
        await pool.query(
            `UPDATE cuidador 
            SET IdEndereco=?, Cpf=?, Nome=?, Email=?, Telefone=?, Senha=?, DataNascimento=?, FotoUrl=?, Biografia=?, Fumante=?, TemFilhos=?, PossuiCNH=?, TemCarro=? 
            WHERE IdCuidador=?`,
            [IdEndereco, Cpf, Nome, Email, Telefone, Senha, DataNascimento, FotoUrl, Biografia, Fumante, TemFilhos, PossuiCNH, TemCarro, id]
        );
        return { IdCuidador: id, ...cuidador };
    }

    static async excluir(id) {
        await pool.query('DELETE FROM cuidador WHERE IdCuidador = ?', [id]);
        return { message: 'Cuidador removido com sucesso' };
    }
}

export default CuidadorModel;
