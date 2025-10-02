document.addEventListener('DOMContentLoaded', () => {
  const tabelaBody = document.querySelector('.responsaveis-table tbody');
  const modalOverlay = document.getElementById('modalOverlay');
  const form = document.getElementById('formResponsavel');

  function calcularIdade(dataNascimento) {
    if (!dataNascimento) return 'Não informado';
    const nascimento = new Date(dataNascimento);
    const hoje = new Date();
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mes = hoje.getMonth() - nascimento.getMonth();
    if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }
    return idade;
  }

  async function carregarResponsaveis() {
    try {
      // 🚀 agora usa o endpoint novo
      const res = await fetch('/api/resp', { method: 'GET' });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const result = await res.json();
      console.log("Dados CRUD:", result); // debug
      
      // Verificar se a resposta tem o formato { success: true, data: [...] }
      const dados = result.success ? result.data : result;

      tabelaBody.innerHTML = '';

      if (!dados || dados.length === 0) {
        tabelaBody.innerHTML = `<tr><td colspan="6" style="text-align:center">Nenhum responsável cadastrado.</td></tr>`;
        return;
      }

      dados.forEach((item) => {
        // Usar imagem padrão local se não houver foto
        const avatarPadrao = '/avatar/cuidador.png';
        const fotoUrl = item.FotoUrl && item.FotoUrl.trim() !== '' ? item.FotoUrl : avatarPadrao;
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td class="foto-cell">
            <img src="${fotoUrl}" 
                 alt="Foto de ${item.Nome}" class="foto-responsavel" />
          </td>
          <td class="nome-cell"><strong>${item.Nome || ''}</strong></td>
          <td class="email-cell">${item.Email || 'Não informado'}</td>
          <td class="telefone-cell">${item.Telefone || 'Não informado'}</td>
          <td class="idade-cell">${calcularIdade(item.DataNascimento)} anos</td>
          <td class="acoes-cell">
            <button class="btn-editar" data-resp='${JSON.stringify(item)}'>Editar</button>
            <button class="btn-excluir" data-id='${item.IdResponsavel}'>Excluir</button>
          </td>
        `;
        tabelaBody.appendChild(tr);
      });

      configurarBotoes();
    } catch (err) {
      console.error('Erro ao carregar responsáveis:', err);
      tabelaBody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:red">Erro: ${err.message}</td></tr>`;
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
        
        // Mensagem de aviso detalhada
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
            const res = await fetch(`/api/resp/${id}`, { method: 'DELETE' });
            const data = await res.json();

            if (!res.ok) {
              alert(`❌ Erro ao excluir:\n\n${data.erro || 'Erro desconhecido. Tente novamente.'}`);
              return;
            }

            alert(`✅ Sucesso!\n\n${nomeResponsavel} e todos os registros relacionados foram excluídos permanentemente.`);
            carregarResponsaveis();
          } catch (e) {
            alert('❌ Erro de conexão ao excluir responsável. Verifique sua conexão e tente novamente.');
            console.error(e);
          }
        }
      };
    });
  }

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const idEdit = form.getAttribute('data-edit-id');
      const dados = {
        Nome: form.nome.value.trim(),
        Email: form.email.value.trim(),
        Telefone: form.telefone.value.trim(),
        Cpf: form.cpf.value.trim(),
        DataNascimento: form.dataNascimento.value,
        FotoUrl: form.fotoUrl.value.trim()
      };

      try {
        const url = idEdit ? `/api/resp/${idEdit}` : '/api/resp'; // 🚀 novo endpoint
        const method = idEdit ? 'PUT' : 'POST';

        const resp = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dados)
        });

        const resposta = await resp.json();
        if (!resp.ok) throw new Error(resposta.erro || 'Erro ao salvar');

        form.reset();
        form.removeAttribute('data-edit-id');
        modalOverlay.classList.remove('active');
        carregarResponsaveis();
      } catch (err) {
        alert(err.message || 'Erro ao salvar responsável.');
        console.error(err);
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
