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
        const connection = await pool.getConnection();
        
        try {
            await connection.beginTransaction();
            
            // 1. Buscar todos os atendimentos deste cuidador
            const [atendimentos] = await connection.query(
                'SELECT IdAtendimento FROM atendimento WHERE IdCuidador = ?',
                [id]
            );
            
            // 2. Excluir dados relacionados aos atendimentos
            if (atendimentos.length > 0) {
                const idsAtendimentos = atendimentos.map(a => a.IdAtendimento);
                const placeholders = idsAtendimentos.map(() => '?').join(',');
                
                // Excluir avaliações dos atendimentos
                await connection.query(
                    `DELETE FROM avaliacao WHERE IdAtendimento IN (${placeholders})`,
                    idsAtendimentos
                );
                
                // Excluir comissões dos atendimentos
                await connection.query(
                    `DELETE FROM comissao WHERE IdAtendimento IN (${placeholders})`,
                    idsAtendimentos
                );
                
                // Excluir receitas dos atendimentos
                await connection.query(
                    `DELETE FROM receita WHERE IdAtendimento IN (${placeholders})`,
                    idsAtendimentos
                );
                
                // Excluir pagamentos dos atendimentos
                await connection.query(
                    `DELETE FROM pagamento WHERE IdAtendimento IN (${placeholders})`,
                    idsAtendimentos
                );
                
                // Excluir histórico dos atendimentos
                await connection.query(
                    `DELETE FROM historicoatendimento WHERE IdAtendimento IN (${placeholders})`,
                    idsAtendimentos
                );
            }
            
            // 3. Excluir avaliações diretas do cuidador (se houver)
            await connection.query('DELETE FROM avaliacao WHERE IdCuidador = ?', [id]);
            
            // 4. Excluir comissões diretas do cuidador (se houver)
            await connection.query('DELETE FROM comissao WHERE IdCuidador = ?', [id]);
            
            // 5. Excluir chats do cuidador
            const [chats] = await connection.query('SELECT IdChat FROM chat WHERE IdCuidador = ?', [id]);
            if (chats.length > 0) {
                const idsChats = chats.map(c => c.IdChat);
                const placeholders = idsChats.map(() => '?').join(',');
                
                // Excluir mensagens dos chats
                await connection.query(
                    `DELETE FROM mensagem WHERE IdChat IN (${placeholders})`,
                    idsChats
                );
                
                // Excluir os chats
                await connection.query(
                    `DELETE FROM chat WHERE IdChat IN (${placeholders})`,
                    idsChats
                );
            }
            
            // 6. Excluir atendimentos do cuidador
            await connection.query('DELETE FROM atendimento WHERE IdCuidador = ?', [id]);
            
            // 7. Excluir especialidades do cuidador
            await connection.query('DELETE FROM cuidadorespecialidade WHERE IdCuidador = ?', [id]);
            
            // 8. Excluir serviços do cuidador
            await connection.query('DELETE FROM cuidadorservico WHERE IdCuidador = ?', [id]);
            
            // 9. Excluir certificados do cuidador
            await connection.query('DELETE FROM certificado WHERE IdCuidador = ?', [id]);
            
            // 10. Excluir experiências do cuidador
            await connection.query('DELETE FROM experiencia WHERE IdCuidador = ?', [id]);
            
            // 11. Excluir formação do cuidador
            await connection.query('DELETE FROM formacao WHERE IdCuidador = ?', [id]);
            
            // 12. Excluir disponibilidade do cuidador
            await connection.query('DELETE FROM disponibilidade WHERE IdCuidador = ?', [id]);
            
            // 13. Excluir registro profissional do cuidador
            await connection.query('DELETE FROM registroprofissional WHERE IdCuidador = ?', [id]);
            
            // 14. Excluir histórico do cuidador
            await connection.query('DELETE FROM historicocuidador WHERE IdCuidador = ?', [id]);
            
            // 15. Excluir despesas relacionadas ao cuidador
            await connection.query('DELETE FROM despesa WHERE IdCuidador = ?', [id]);
            
            // 16. Finalmente, excluir o cuidador
            await connection.query('DELETE FROM cuidador WHERE IdCuidador = ?', [id]);
            
            await connection.commit();
            return { message: 'Cuidador e todos os registros relacionados foram removidos com sucesso' };
        } catch (error) {
            await connection.rollback();
            console.error('Erro ao excluir cuidador:', error);
            throw new Error('Não foi possível excluir o cuidador. Por favor, tente novamente.');
        } finally {
            connection.release();
        }
    }
}

export default CuidadorModel;
