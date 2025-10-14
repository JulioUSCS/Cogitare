import Responsavel from '../models/responsavelModel.js';

const listarTodos = async (req, res) => {
  try {
    const rows = await Responsavel.listar();
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error("Erro ao listar responsáveis:", error);
    res.status(500).json({ success: false, message: "Erro ao buscar responsáveis" });
  }
};

const listarParaSelect = async (req, res) => {
  try {
    const rows = await Responsavel.listar();
    const selectRows = rows.map(r => ({ IdResponsavel: r.IdResponsavel, Nome: r.Nome }));
    res.json({ success: true, data: selectRows });
  } catch (error) {
    console.error("Erro ao listar responsáveis (select):", error);
    res.status(500).json({ success: false, message: "Erro ao buscar responsáveis" });
  }
};

const criar = async (req, res) => {
  try {
    const id = await Responsavel.criar(req.body);
    res.status(201).json({ id });
  } catch (error) {
    console.error("Erro ao criar responsável:", error);
    res.status(500).json({ erro: "Erro ao criar responsável" });
  }
};

const atualizar = async (req, res) => {
  try {
    await Responsavel.atualizar(req.params.id, req.body);
    res.status(200).json({ mensagem: "Responsável atualizado com sucesso" });
  } catch (error) {
    console.error("Erro ao atualizar responsável:", error);
    res.status(500).json({ erro: "Erro ao atualizar responsável" });
  }
};

const excluir = async (req, res) => {
  try {
    await Responsavel.excluir(req.params.id);
    res.status(200).json({ mensagem: "Responsável excluído com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir responsável:", error);
    res.status(500).json({ erro: "Erro ao excluir responsável" });
  }
};

export default {
  listarTodos,
  listarParaSelect,
  criar,
  atualizar,
  excluir
};
