// model/usuarioModel.js
import pool from '../config/db.js';
import bcrypt from 'bcrypt';

const Usuario = {
  async validarLogin(usuario, senha) {
    try {
      const [rows] = await pool.query(
        'SELECT IdAdministrador, Usuario, Senha, Tipo, Nome, Email, Ativo, UltimoAcesso FROM administrador WHERE Usuario = ? AND Ativo = 1',
        [usuario]
      );

      const admin = rows[0];
      if (!admin) return null;

      const senhaValida = await bcrypt.compare(senha, admin.Senha);
      if (!senhaValida) return null;

      await pool.query(
        'UPDATE administrador SET UltimoAcesso = NOW() WHERE IdAdministrador = ?',
        [admin.IdAdministrador]
      );

      await pool.query(
        'INSERT INTO historicoadministrador (IdAdministrador, Operacao, DataOperacao) VALUES (?, ?, NOW())',
        [admin.IdAdministrador, 'Login']
      );

      return {
        id: admin.IdAdministrador,
        usuario: admin.Usuario,
        nome: admin.Nome || admin.Usuario,
        email: admin.Email,
        tipo: admin.Tipo,
        ultimoAcesso: admin.UltimoAcesso
      };
    } catch (err) {
      console.error('Erro detalhado ao validar login:', err);
      throw new Error('Erro ao validar login: ' + err.message);
    }
  }
};

export default Usuario;
