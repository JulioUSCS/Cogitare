// model/usuarioModel.js
import pool from '../config/db.js';
import bcrypt from 'bcrypt';

const Usuario = {
  async validarLogin(usuario, senha) {
    try {
      // Buscar admin via SP (retorna hash da senha)
      const [result] = await pool.execute('CALL sp_buscar_admin_por_usuario(?)', [usuario]);
      const admin = result && result[0] ? result[0][0] : null;
      if (!admin) return null;

      const senhaValida = await bcrypt.compare(senha, admin.Senha);
      if (!senhaValida) return null;

      // Registrar login via SP (atualiza UltimoAcesso e grava histórico)
      await pool.execute('CALL sp_registrar_login_admin(?)', [admin.IdAdministrador]);

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
