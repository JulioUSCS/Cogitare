document.addEventListener('DOMContentLoaded', () => {
  const tabelaBody = document.querySelector('.responsaveis-table tbody');
  const modalOverlay = document.getElementById('modalOverlay');
  const form = document.getElementById('formResponsavel');

  const formatarCampo = (valor, fallback = 'Não informado') => {
    if (valor === null || valor === undefined) return fallback;
    const texto = String(valor).trim();
    return texto.length > 0 ? texto : fallback;
  };

  const formatarTelefone = (telefone) => {
    const apenasNumeros = (telefone || '').replace(/\D/g, '');
    if (apenasNumeros.length === 10) {
      return apenasNumeros.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    if (apenasNumeros.length === 11) {
      return apenasNumeros.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    return formatarCampo(telefone);
  };

  const normalizarUrlOpcional = (valor) => {
    const texto = typeof valor === 'string' ? valor.trim() : '';
    return texto ? texto : null;
  };

  function calcularIdade(dataNascimento) {
    if (!dataNascimento) return 'Não informado';
    const nascimento = new Date(dataNascimento);
    if (Number.isNaN(nascimento.getTime())) return 'Não informado';
    const hoje = new Date();
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mes = hoje.getMonth() - nascimento.getMonth();
    if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }
    return `${idade} anos`;
  }

  async function carregarResponsaveis(mostrarAviso = false) {
    if (!tabelaBody) return;

    tabelaBody.innerHTML = `<tr><td colspan="6" style="text-align:center">Carregando responsáveis...</td></tr>`;

    try {
      const dados = await apiFetch('/api/resp', {}, {
        suppressDefaultError: true,
        parseJson: true
      });

      const lista = Array.isArray(dados?.data) ? dados.data : dados;

      tabelaBody.innerHTML = '';

      if (!Array.isArray(lista) || lista.length === 0) {
        tabelaBody.innerHTML = `<tr><td colspan="6" style="text-align:center">Nenhum responsável cadastrado.</td></tr>`;
        if (mostrarAviso) {
          showToast('Nenhum responsável encontrado.', 'info');
        }
        return;
      }

      lista.forEach((item) => {
        const avatarPadrao = '/avatar/cuidador.png';
        const fotoUrl = item.FotoUrl && item.FotoUrl.trim() !== '' ? item.FotoUrl : avatarPadrao;

        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td class="foto-cell">
            <img src="${fotoUrl}"
                 alt="Foto de ${formatarCampo(item.Nome, 'Responsável')}" class="foto-responsavel" />
          </td>
          <td class="nome-cell"><strong>${formatarCampo(item.Nome, 'Responsável')}</strong></td>
          <td class="email-cell">${formatarCampo(item.Email)}</td>
          <td class="telefone-cell">
            ${formatarTelefone(item.Telefone)}
            ${item.Cpf ? `<span class="tabela-subtexto">CPF: ${item.Cpf}</span>` : ''}
          </td>
          <td class="idade-cell">${calcularIdade(item.DataNascimento)}</td>
          <td class="acoes-cell">
            <button class="btn-editar" data-resp='${JSON.stringify(item)}'>Editar</button>
            <button class="btn-excluir" data-id='${item.IdResponsavel}'>Excluir</button>
          </td>
        `;
        tabelaBody.appendChild(tr);
      });

      configurarBotoes();

      if (mostrarAviso) {
        showToast('Lista de responsáveis atualizada.', 'success');
      }
    } catch (err) {
      console.error('Erro ao carregar responsáveis:', err);
      tabelaBody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:#e74c3c">Não foi possível carregar os responsáveis.</td></tr>`;
      showDetailedError(err, 'Não foi possível carregar os responsáveis. Tente novamente.');
    }
  }

  function configurarBotoes() {
    document.querySelectorAll('.btn-editar').forEach(botao => {
      botao.onclick = () => {
        const r = JSON.parse(botao.getAttribute('data-resp'));
        form.nome.value = r.Nome || '';
        form.email.value = r.Email || '';
        form.telefone.value = r.Telefone || '';
        form.cpf.value = r.Cpf || '';
        form.dataNascimento.value = r.DataNascimento ? String(r.DataNascimento).split('T')[0] : '';
        form.fotoUrl.value = r.FotoUrl || '';
        form.setAttribute('data-edit-id', r.IdResponsavel);
        modalOverlay.classList.add('active');
      };
    });

    document.querySelectorAll('.btn-excluir').forEach(botao => {
      botao.onclick = async () => {
        const id = botao.getAttribute('data-id');
        const nomeResponsavel = botao.closest('tr').querySelector('td:nth-child(2)').textContent.trim();

        const mensagemAviso = `⚠️ ATENÇÃO - EXCLUSÃO PERMANENTE ⚠️\n\n` +
            `Você está prestes a excluir o responsável: ${nomeResponsavel}\n\n` +
            `Esta ação irá excluir PERMANENTEMENTE:\n` +
            `• O responsável\n` +
            `• TODOS OS IDOSOS associados a este responsável\n` +
            `• Todos os atendimentos dos idosos\n` +
            `• Todas as avaliações relacionadas\n` +
            `• Todos os pagamentos e receitas\n` +
            `• Histórico completo de todos os registros\n\n` +
            `⚠️ ESTA AÇÃO NÃO PODE SER DESFEITA! ⚠️\n\n` +
            `Deseja realmente continuar?`;

        if (confirm(mensagemAviso)) {
          try {
            await apiFetch(`/api/resp/${id}`, {
              method: 'DELETE'
            }, {
              loadingMessage: `Excluindo ${nomeResponsavel}...`,
              successMessage: `${nomeResponsavel} e todos os registros relacionados foram excluídos.`,
              suppressDefaultError: true,
              parseJson: true
            });
            carregarResponsaveis(true);
          } catch (e) {
            console.error(e);
            showDetailedError(e, 'Erro ao excluir responsável. Verifique vínculos existentes e tente novamente.');
          }
        }
      };
    });
  }

  if (form) {
    const camposFormulario = [
      { field: form.nome, name: 'Nome completo', rules: { required: true, minLength: 3 } },
      { field: form.email, name: 'E-mail', rules: { required: true, email: true } },
      {
        field: form.telefone,
        name: 'Telefone',
        rules: {
          required: true,
          pattern: /^(\+?\d{1,3})?\s*\(?\d{2}\)?\s*\d{4,5}[- ]?\d{4}$/,
          patternMessage: 'Informe o telefone com DDD. Ex.: (11) 98888-7777.'
        }
      },
      {
        field: form.cpf,
        name: 'CPF',
        rules: {
          custom: (valor) => {
            if (!valor) return true;
            const somenteDigitos = valor.replace(/\D/g, '');
            if (somenteDigitos.length !== 11) {
              return 'CPF deve conter 11 dígitos.';
            }
            return true;
          }
        }
      },
      {
        field: form.dataNascimento,
        name: 'Data de nascimento',
        rules: { required: true, date: true, future: false }
      },
      {
        field: form.fotoUrl,
        name: 'Foto/Avatar',
        rules: {
          custom: (valor) => {
            if (!valor) return true;
            return /^(https?:\/\/|\/)/i.test(valor) || 'Informe uma URL válida ou deixe em branco para usar o avatar padrão.';
          }
        }
      }
    ];

    attachValidationListeners(camposFormulario);

    const submitButton = form.querySelector('button[type="submit"]');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const idEdit = form.getAttribute('data-edit-id');

      const validacao = validateFields(camposFormulario);
      if (!validacao.valid) {
        const mensagem = ['Corrija os campos destacados antes de continuar:', ...validacao.messages.map((msg) => `• ${msg}`)].join('\n');
        showToast(mensagem, 'error');
        return;
      }

      const dados = {
        Nome: form.nome.value.trim(),
        Email: form.email.value.trim(),
        Telefone: form.telefone.value.trim(),
        Cpf: form.cpf.value.trim(),
        DataNascimento: form.dataNascimento.value,
        FotoUrl: normalizarUrlOpcional(form.fotoUrl.value)
      };

      const url = idEdit ? `/api/resp/${idEdit}` : '/api/resp';
      const method = idEdit ? 'PUT' : 'POST';

      try {
        await apiFetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dados)
        }, {
          button: submitButton,
          loadingButtonText: idEdit ? 'Atualizando...' : 'Salvando...',
          successMessage: idEdit ? 'Responsável atualizado com sucesso.' : 'Responsável cadastrado com sucesso.',
          suppressDefaultError: true,
          parseJson: true
        });

        form.reset();
        form.removeAttribute('data-edit-id');
        modalOverlay.classList.remove('active');
        carregarResponsaveis(true);
      } catch (err) {
        console.error(err);
        showDetailedError(err, 'Erro ao salvar responsável. Verifique os dados informados.');
      }
    });
  }

  const btnAbrir = document.getElementById('btnToggleForm');
  const btnFechar = document.getElementById('btnCloseModal');
  if (btnAbrir) btnAbrir.addEventListener('click', () => modalOverlay.classList.add('active'));
  if (btnFechar) btnFechar.addEventListener('click', () => modalOverlay.classList.remove('active'));
  modalOverlay?.addEventListener('click', (e) => { if (e.target === modalOverlay) modalOverlay.classList.remove('active'); });

  const searchInput = document.querySelector('.search-input');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      const termo = searchInput.value.toLowerCase();
      document.querySelectorAll('.responsaveis-table tbody tr').forEach(tr => {
        const nome = tr.querySelector('.nome-cell')?.textContent.toLowerCase() || '';
        tr.style.display = nome.includes(termo) ? '' : 'none';
      });
    });
  }

  carregarResponsaveis();
});
