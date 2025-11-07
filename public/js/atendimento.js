document.addEventListener('DOMContentLoaded', () => {
    const formatarDataHora = (dataStr) => {
        if (!dataStr) return '-';
        const data = new Date(dataStr);
        if (Number.isNaN(data.getTime())) return '-';
        return data.toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatarValor = (valor) => {
        if (valor === null || valor === undefined) return '—';
        const numero = Number(valor);
        if (Number.isNaN(numero)) return '—';
        return numero.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    async function carregarAtendimentos(mostrarAviso = false) {
        const tabelaBody = document.querySelector('.atendimento-table tbody');
        if (!tabelaBody) return;

        tabelaBody.innerHTML = `
            <tr>
              <td colspan="10" style="text-align: center;">Carregando atendimentos...</td>
            </tr>`;

        try {
            const resultado = await apiFetch('/api/atendimento', {}, {
                suppressDefaultError: true,
                parseJson: true
            });
            const atendimentos = Array.isArray(resultado?.data) ? resultado.data : resultado;

            tabelaBody.innerHTML = '';

            if (!Array.isArray(atendimentos) || atendimentos.length === 0) {
                tabelaBody.innerHTML = `
                        <tr>
                          <td colspan="10" style="text-align: center;">Nenhum atendimento cadastrado.</td>
                        </tr>`;
                if (mostrarAviso) {
                    showToast('Nenhum atendimento encontrado.', 'info');
                }
                return;
            }

            atendimentos.forEach((atendimento) => {
                const dataInicio = formatarDataHora(atendimento.DataInicio);
                const dataFim = formatarDataHora(atendimento.DataFim);
                const valorFormatado = formatarValor(atendimento.Valor);
                const endereco = atendimento.Local || 'Local não informado';
                const status = atendimento.Status || 'Status não informado';
                const observacoes = atendimento.ObservacaoExtra || 'Sem observações adicionais';

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td class="nome-cell"><strong>${atendimento.NomeCuidador || 'Cuidador não informado'}</strong></td>
                    <td class="email-cell">${atendimento.NomeIdoso || 'Idoso não informado'}</td>
                    <td class="telefone-cell">
                        ${atendimento.NomeResponsavel || 'Responsável não informado'}
                        ${atendimento.EmailResponsavel ? `<span class="tabela-subtexto">${atendimento.EmailResponsavel}</span>` : ''}
                    </td>
                    <td class="idade-cell">${dataInicio}</td>
                    <td class="biografia-cell">${dataFim}</td>
                    <td class="status-cell">${status}</td>
                    <td class="local-cell">
                        ${endereco}
                        ${atendimento.CidadeEstado ? `<span class="tabela-subtexto">${atendimento.CidadeEstado}</span>` : ''}
                    </td>
                    <td class="valor-cell">${valorFormatado}</td>
                    <td class="obs-cell">${observacoes}</td>
                    <td class="acoes-cell">
                        <button class="btn-excluir" data-id="${atendimento.IdAtendimento}">Cancelar</button>
                    </td>
                `;
                tabelaBody.appendChild(tr);
            });

            configurarBotoesExcluir();

            if (mostrarAviso) {
                showToast('Lista de atendimentos atualizada.', 'success');
            }
        } catch (error) {
            console.error(error);
            tabelaBody.innerHTML = `
                  <tr>
                    <td colspan="10" style="text-align: center; color: #e74c3c;">Erro ao carregar os dados dos atendimentos.</td>
                  </tr>`;
            showDetailedError(error, 'Não foi possível carregar os atendimentos. Tente novamente.');
        }
    }

    function configurarBotoesExcluir() {
        document.querySelectorAll('.btn-excluir').forEach(botao => {
            botao.addEventListener('click', async () => {
                const id = botao.getAttribute('data-id');
                
                // Mensagem de aviso detalhada
                const mensagemAviso = `⚠️ ATENÇÃO - EXCLUSÃO PERMANENTE ⚠️\n\n` +
                    `Você está prestes a excluir este atendimento.\n\n` +
                    `Esta ação irá excluir PERMANENTEMENTE:\n` +
                    `• O registro do atendimento\n` +
                    `• Avaliações relacionadas a este atendimento\n` +
                    `• Comissões geradas\n` +
                    `• Pagamentos e receitas vinculadas\n` +
                    `• Histórico do atendimento\n\n` +
                    `⚠️ ESTA AÇÃO NÃO PODE SER DESFEITA! ⚠️\n\n` +
                    `Deseja realmente continuar?`;
                
                if (confirm(mensagemAviso)) {
                    try {
                        await apiFetch(`/api/atendimento/${id}`, {
                            method: 'DELETE'
                        }, {
                            loadingMessage: 'Cancelando atendimento...',
                            successMessage: 'Atendimento excluído com sucesso.',
                            suppressDefaultError: true,
                            parseJson: true
                        });
                        carregarAtendimentos(true);
                    } catch (error) {
                        console.error(error);
                        showDetailedError(error, 'Erro ao excluir atendimento. Verifique vínculos ou tente novamente.');
                    }
                }
            });
        });
    }

    // Pesquisa por nome
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            const termo = searchInput.value.toLowerCase();
            document.querySelectorAll('.atendimento-table tbody tr').forEach(tr => {
                const nome = tr.querySelector('.nome-cell').textContent.toLowerCase();
                tr.style.display = nome.includes(termo) ? '' : 'none';
            });
        });
    }

    carregarAtendimentos();
});