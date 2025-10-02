// model/idosoModel.js
import pool from '../config/db.js';

const Idoso = {
  async listar() {
    const [rows] = await pool.query('SELECT * FROM idoso');
    return rows;

  },

  async criar(dados) {
    const [result] = await pool.query(
      `INSERT INTO idoso (IdResponsavel, IdMobilidade, IdNivelAutonomia, Nome, DataNascimento, Sexo, CuidadosMedicos, DescricaoExtra, FotoUrl) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        dados.IdResponsavel,
        dados.IdMobilidade,
        dados.IdNivelAutonomia,
        dados.Nome,
        dados.DataNascimento,
        dados.Sexo,
        dados.CuidadosMedicos,
        dados.DescricaoExtra,
        dados.FotoUrl
      ]
    );

    const novoIdIdoso = result.insertId;

    // Inserir no histórico do administrador
    await pool.query(
      'INSERT INTO historicoadministrador (IdAdministrador, Operacao, DataOperacao) VALUES (?, ?, NOW())',
      [dados.IdAdministrador, `Idoso ${dados.Nome} (ID ${novoIdIdoso}) criado.`]
    );

    return novoIdIdoso;
  },

  async atualizar(id, dados) {
    await pool.query(
      `UPDATE idoso SET 
          IdResponsavel = ?, IdMobilidade = ?, IdNivelAutonomia = ?, Nome = ?, 
          DataNascimento = ?, Sexo = ?, CuidadosMedicos = ?, DescricaoExtra = ?, FotoUrl = ?
       WHERE IdIdoso = ?`,
      [
        dados.IdResponsavel,
        dados.IdMobilidade,
        dados.IdNivelAutonomia,
        dados.Nome,
        dados.DataNascimento,
        dados.Sexo,
        dados.CuidadosMedicos,
        dados.DescricaoExtra,
        dados.FotoUrl,
        id
      ]
    );

    // Inserir no histórico do administrador
    await pool.query(
      'INSERT INTO historicoadministrador (IdAdministrador, Operacao, DataOperacao) VALUES (?, ?, NOW())',
      [dados.IdAdministrador, `Idoso ${dados.Nome} (ID ${id}) alterado.`]
    );
  },

  async excluir(id) {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // 1. Buscar todos os atendimentos deste idoso
      const [atendimentos] = await connection.query(
        'SELECT IdAtendimento FROM atendimento WHERE IdIdoso = ?',
        [id]
      );
      
      // 2. Excluir avaliações dos atendimentos
      if (atendimentos.length > 0) {
        const idsAtendimentos = atendimentos.map(a => a.IdAtendimento);
        await connection.query(
          `DELETE FROM avaliacao WHERE IdAtendimento IN (${idsAtendimentos.join(',')})`,
          []
        );
        
        // 3. Excluir comissões dos atendimentos
        await connection.query(
          `DELETE FROM comissao WHERE IdAtendimento IN (${idsAtendimentos.join(',')})`,
          []
        );
        
        // 4. Excluir receitas dos atendimentos
        await connection.query(
          `DELETE FROM receita WHERE IdAtendimento IN (${idsAtendimentos.join(',')})`,
          []
        );
        
        // 5. Excluir pagamentos dos atendimentos
        await connection.query(
          `DELETE FROM pagamento WHERE IdAtendimento IN (${idsAtendimentos.join(',')})`,
          []
        );
        
        // 6. Excluir histórico dos atendimentos
        await connection.query(
          `DELETE FROM historicoatendimento WHERE IdAtendimento IN (${idsAtendimentos.join(',')})`,
          []
        );
      }
      
      // 7. Excluir doenças e restrições alimentares do idoso (CASCADE já cuidará disso, mas por segurança)
      await connection.query('DELETE FROM idosodoenca WHERE IdIdoso = ?', [id]);
      await connection.query('DELETE FROM idosorestricaoalimentar WHERE IdIdoso = ?', [id]);
      
      // 8. Excluir atendimentos (CASCADE funcionará agora)
      await connection.query('DELETE FROM atendimento WHERE IdIdoso = ?', [id]);
      
      // 9. Finalmente, excluir o idoso
      await connection.query('DELETE FROM idoso WHERE IdIdoso = ?', [id]);
      
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      console.error('Erro ao excluir idoso:', error);
      throw new Error('Não foi possível excluir o idoso. Por favor, tente novamente.');
    } finally {
      connection.release();
    }
  },

  async listarResponsavel() {
    const [rows] = await pool.query('SELECT IdResponsavel, Nome FROM responsavel ORDER BY Nome');
    return rows;
  },

  async listarMobilidade() {
    const [rows] = await pool.query('SELECT * FROM mobilidade ORDER BY Descricao');
    return rows;
  },

  async listarNivelAutonomia() {
    const [rows] = await pool.query('SELECT * FROM nivelautonomia ORDER BY Descricao');
    return rows;
  }
};

export default Idoso;
