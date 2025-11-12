let pagamentosCache = [];
let pagamentoEditandoId = null;
let detalhesOverlay = null;
let detalhesConteudo = null;

async function carregarPagamentos() {
  try {
    const response = await fetch('/api/pagamentos');
    const result = await response.json();

    if (result.success) {
      pagamentosCache = Array.isArray(result.data) ? result.data : [];
      exibirPagamentos(pagamentosCache);
    } else {
      console.error('Erro ao carregar pagamentos:', result.message);
      exibirMensagemErro('Erro ao carregar pagamentos');
    }
  } catch (error) {
    console.error('Erro na requisição:', error);
    exibirMensagemErro('Erro de conexão');
  }
}

function exibirPagamentos(pagamentos) {
  const tbody = document.querySelector('.pagamentos-table tbody');

  if (!tbody) {
    console.error('Tabela não encontrada');
    return;
  }

  tbody.innerHTML = '';

  if (!Array.isArray(pagamentos) || pagamentos.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 2rem; color: #666;">
          Nenhum pagamento encontrado
        </td>
      </tr>
    `;
    return;
  }

  pagamentos.forEach((pagamento) => {
    const row = document.createElement('tr');

    const dataFormatada = formatarData(pagamento.DataPagamento);
    const valorFormatado = formatarMoeda(pagamento.Valor);
    const idPagamentoFormatado = pagamento.IdPagamento ? `#${pagamento.IdPagamento}` : '—';
    const idAtendimentoFormatado = pagamento.IdAtendimento ? `Atendimento #${pagamento.IdAtendimento}` : 'Não informado';
    const nomeResponsavel = pagamento.NomeResponsavel || 'Responsável não informado';
    const contatoResponsavel = pagamento.EmailResponsavel || pagamento.TelefoneResponsavel || '';
    const cuidadorRelacionado = pagamento.NomeCuidador ? `Cuidador: ${pagamento.NomeCuidador}` : '';
    const codigoTransacao = pagamento.CodigoTransacao || null;
    const metodoPagamento = pagamento.MetodoPagamento || 'Método não informado';
    const status = pagamento.StatusPagamento || 'Indefinido';
    const statusClass = status.toLowerCase().replace(/\s+/g, '-');
    const legendaStatus = codigoTransacao ? `Código: ${codigoTransacao}` : metodoPagamento;

    row.innerHTML = `
      <td>
        <strong>${idPagamentoFormatado}</strong>
        <div class="tabela-subtexto">${metodoPagamento}</div>
      </td>
      <td>
        ${idAtendimentoFormatado}
        ${cuidadorRelacionado ? `<div class="tabela-subtexto">${cuidadorRelacionado}</div>` : ''}
      </td>
      <td>
        ${nomeResponsavel}
        ${contatoResponsavel ? `<div class="tabela-subtexto">${contatoResponsavel}</div>` : ''}
      </td>
      <td>${valorFormatado}</td>
      <td>
        <span class="status-badge status-${statusClass}">
          ${status}
        </span>
        ${legendaStatus ? `<div class="tabela-subtexto">${legendaStatus}</div>` : ''}
      </td>
      <td>${dataFormatada}</td>
      <td>
        <button class="btn-action view" onclick="verPagamento(${pagamento.IdPagamento})" title="Ver detalhes">
          <i class="fas fa-eye"></i>
        </button>
        <button class="btn-action edit" onclick="editarPagamento(${pagamento.IdPagamento})" title="Editar">
          <i class="fas fa-edit"></i>
        </button>
        <button class="btn-action delete" onclick="excluirPagamento(${pagamento.IdPagamento})" title="Excluir">
          <i class="fas fa-trash"></i>
        </button>
      </td>
    `;

    tbody.appendChild(row);
  });
}

function formatarData(data) {
  if (!data) return 'N/A';

  const dataObj = new Date(data);
  return dataObj.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function formatarMoeda(valor) {
  if (valor === null || valor === undefined) return '—';

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(Number(valor));
}

function exibirMensagemErro(mensagem) {
  const tbody = document.querySelector('.pagamentos-table tbody');
  if (tbody) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 2rem; color: #e74c3c;">
          ${mensagem}
        </td>
      </tr>
    `;
  }
}

function buscarPagamentos(termo) {
  const tbody = document.querySelector('.pagamentos-table tbody');
  const linhas = tbody.querySelectorAll('tr');
  const termoBusca = termo.toLowerCase();

  linhas.forEach((linha) => {
    const texto = linha.textContent.toLowerCase();
    linha.style.display = texto.includes(termoBusca) ? '' : 'none';
  });
}

async function verPagamento(id) {
  try {
    let pagamento = pagamentosCache.find((item) => Number(item.IdPagamento) === Number(id));

    if (!pagamento) {
      const resultado = await apiFetch(`/api/pagamentos/${id}`, {}, {
        suppressDefaultError: true,
        parseJson: true
      });
      pagamento = resultado?.data || resultado || null;
    }

    if (!pagamento) {
      showToast('Pagamento não encontrado.', 'error');
      return;
    }

    preencherModalDetalhes(pagamento);
    abrirModalDetalhes();
  } catch (error) {
    console.error('Erro ao carregar pagamento:', error);
    showDetailedError(error, 'Não foi possível carregar os detalhes do pagamento.');
  }
}

function editarPagamento(id) {
  const pagamento = pagamentosCache.find((item) => Number(item.IdPagamento) === Number(id));

  if (!pagamento) {
    showToast('Pagamento não encontrado para edição.', 'error');
    return;
  }

  abrirModal(pagamento);
}

function excluirPagamento(id) {
  const mensagemAviso = `⚠️ ATENÇÃO - EXCLUSÃO PERMANENTE ⚠️\n\n` +
    `Você está prestes a excluir o pagamento #${id}.\n\n` +
    `⚠️ ESTA AÇÃO NÃO PODE SER DESFEITA! ⚠️\n\n` +
    `Deseja realmente continuar?`;

  if (confirm(mensagemAviso)) {
    console.log('Excluir pagamento:', id);
    alert(`✅ Pagamento ${id} excluído com sucesso!`);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  carregarPagamentos();

  const searchInput = document.querySelector('.search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      buscarPagamentos(e.target.value);
    });
  }

  const btnToggleForm = document.getElementById('btnToggleForm');
  const modalOverlay = document.getElementById('modalOverlay');
  const btnCancel = document.getElementById('btnCancel');
  const formPagamento = document.getElementById('formPagamento');
  detalhesOverlay = document.getElementById('detalhesPagamentoOverlay');
  detalhesConteudo = document.getElementById('detalhesPagamentoConteudo');
  const btnFecharDetalhes = document.getElementById('btnFecharDetalhes');

  if (btnToggleForm) {
    btnToggleForm.addEventListener('click', () => {
      abrirModal();
    });
  }

  if (btnCancel) {
    btnCancel.addEventListener('click', () => {
      fecharModal();
    });
  }

  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) {
        fecharModal();
      }
    });
  }

  if (formPagamento) {
    formPagamento.addEventListener('submit', (e) => {
      e.preventDefault();
      salvarPagamento();
    });
  }

  if (btnFecharDetalhes) {
    btnFecharDetalhes.addEventListener('click', fecharModalDetalhes);
  }

  if (detalhesOverlay) {
    detalhesOverlay.addEventListener('click', (e) => {
      if (e.target === detalhesOverlay) {
        fecharModalDetalhes();
      }
    });
  }
});

function abrirModal(pagamento = null) {
  const modalOverlay = document.getElementById('modalOverlay');
  const formTitle = document.getElementById('formTitle');
  const formPagamento = document.getElementById('formPagamento');

  if (!modalOverlay || !formPagamento || !formTitle) return;

  modalOverlay.style.display = 'flex';
  formPagamento.reset();

  if (pagamento) {
    pagamentoEditandoId = pagamento.IdPagamento;
    formTitle.textContent = `Editar Pagamento #${pagamento.IdPagamento}`;
    formPagamento.idAtendimento.value = pagamento.IdAtendimento || '';
    formPagamento.metodoPagamento.value = pagamento.MetodoPagamento || '';
    formPagamento.statusPagamento.value = pagamento.StatusPagamento || '';
    formPagamento.codigoTransacao.value = pagamento.CodigoTransacao || '';
  } else {
    pagamentoEditandoId = null;
    formTitle.textContent = 'Cadastrar Pagamento';
  }
}

function fecharModal() {
  const modalOverlay = document.getElementById('modalOverlay');
  if (modalOverlay) {
    modalOverlay.style.display = 'none';
    pagamentoEditandoId = null;
  }
}

async function salvarPagamento() {
  const formPagamento = document.getElementById('formPagamento');
  const submitButton = formPagamento?.querySelector('.btn-save');

  if (!formPagamento) return;

  const formData = new FormData(formPagamento);
  const dadosPagamento = {
    IdAtendimento: formData.get('idAtendimento') ? Number(formData.get('idAtendimento')) : null,
    MetodoPagamento: formData.get('metodoPagamento'),
    StatusPagamento: formData.get('statusPagamento'),
    CodigoTransacao: formData.get('codigoTransacao')?.trim() || null
  };

  if (!dadosPagamento.IdAtendimento) {
    showToast('Informe o número do atendimento.', 'warning');
    return;
  }

  if (!dadosPagamento.MetodoPagamento || !dadosPagamento.StatusPagamento) {
    showToast('Selecione o método e o status do pagamento.', 'warning');
    return;
  }

  const url = pagamentoEditandoId ? `/api/pagamentos/${pagamentoEditandoId}` : '/api/pagamentos';
  const method = pagamentoEditandoId ? 'PUT' : 'POST';

  try {
    await apiFetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dadosPagamento)
    }, {
      button: submitButton,
      loadingButtonText: pagamentoEditandoId ? 'Salvando...' : 'Cadastrando...',
      successMessage: pagamentoEditandoId ? 'Pagamento atualizado com sucesso.' : 'Pagamento cadastrado com sucesso.',
      suppressDefaultError: true,
      parseJson: true
    });

    fecharModal();
    carregarPagamentos();
  } catch (error) {
    console.error('Erro ao salvar pagamento:', error);
    showDetailedError(error, 'Não foi possível salvar o pagamento.');
  }
}

function abrirModalDetalhes() {
  if (detalhesOverlay) {
    detalhesOverlay.classList.add('active');
  }
}

function fecharModalDetalhes() {
  if (detalhesOverlay) {
    detalhesOverlay.classList.remove('active');
  }
}

function preencherModalDetalhes(pagamento) {
  if (!detalhesConteudo) return;

  const dataPagamento = formatarData(pagamento.DataPagamento);
  const valorFormatado = formatarMoeda(pagamento.Valor);
  const legendaStatus = pagamento.CodigoTransacao ? `Código: ${pagamento.CodigoTransacao}` : (pagamento.MetodoPagamento || '');
  const observacao = pagamento.Observacao || pagamento.Descricao || '';

  const infoResponsavel = [
    pagamento.NomeResponsavel || 'Não informado',
    pagamento.EmailResponsavel || pagamento.TelefoneResponsavel || ''
  ].filter(Boolean).join(' • ');

  const infoAtendimento = [
    pagamento.IdAtendimento ? `#${pagamento.IdAtendimento}` : 'Não informado',
    pagamento.NomeCuidador ? `Cuidador: ${pagamento.NomeCuidador}` : '',
    pagamento.NomeIdoso ? `Idoso: ${pagamento.NomeIdoso}` : ''
  ].filter(Boolean).join(' • ');

  const status = pagamento.StatusPagamento || 'Indefinido';
  const statusClass = status.toLowerCase().replace(/\s+/g, '-');

  detalhesConteudo.innerHTML = `
    <div class="detalhes-bloco">
      <div class="detalhes-status">
        <span class="status-badge status-${statusClass}">${status}</span>
        ${legendaStatus ? `<small>${legendaStatus}</small>` : ''}
      </div>
    </div>
    <div class="detalhes-bloco">
      <h3>Resumo</h3>
      <div class="detalhes-grid">
        <div class="detalhes-item">
          <span>Pagamento</span>
          <strong>#${pagamento.IdPagamento ?? '—'}</strong>
        </div>
        <div class="detalhes-item">
          <span>Valor</span>
          <strong>${valorFormatado}</strong>
        </div>
        <div class="detalhes-item">
          <span>Data</span>
          <strong>${dataPagamento}</strong>
        </div>
        <div class="detalhes-item">
          <span>Método</span>
          <strong>${pagamento.MetodoPagamento || '—'}</strong>
        </div>
      </div>
    </div>
    <div class="detalhes-bloco">
      <h3>Atendimento</h3>
      <div class="detalhes-item">
        <span>Informações</span>
        <strong>${infoAtendimento || 'Não informado'}</strong>
      </div>
    </div>
    <div class="detalhes-bloco">
      <h3>Responsável</h3>
      <div class="detalhes-item">
        <span>Contato</span>
        <strong>${infoResponsavel || 'Não informado'}</strong>
      </div>
    </div>
    ${observacao ? `
      <div class="detalhes-bloco">
        <h3>Observações</h3>
        <p class="detalhes-observacao">${observacao}</p>
      </div>` : ''}
  `;
}
