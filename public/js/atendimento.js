document.addEventListener('DOMContentLoaded', () => {
    function carregarAtendimentos() {
        fetch('/api/atendimento')
            .then(response => {
                if (!response.ok) throw new Error('Erro ao buscar atendimentos');
                return response.json();
            })
            .then(result => {
                // Verificar se a resposta tem o formato { success: true, data: [...] }
                const atendimentos = result.success ? result.data : result;
                
                const tabelaBody = document.querySelector('.atendimento-table tbody');
                tabelaBody.innerHTML = '';

                if (!atendimentos || atendimentos.length === 0) {
                    tabelaBody.innerHTML = `
                        <tr>
                          <td colspan="10" style="text-align: center;">Nenhum atendimento cadastrado.</td>
                        </tr>`;
                    return;
                }

                atendimentos.forEach(atendimento => {
                    // Função para formatar data/hora para padrão brasileiro dd/mm/yyyy - hh:mm
                    function formatarDataHora(dataStr) {
                        if (!dataStr) return '-';
                        const data = new Date(dataStr);
                        if (isNaN(data.getTime())) return '-';
                        const dia = String(data.getDate()).padStart(2, '0');
                        const mes = String(data.getMonth() + 1).padStart(2, '0');
                        const ano = data.getFullYear();
                        const hora = String(data.getHours()).padStart(2, '0');
                        const min = String(data.getMinutes()).padStart(2, '0');
                        return `${dia}/${mes}/${ano} - ${hora}:${min}`;
                    }

                    const dataInicioFormatada = formatarDataHora(atendimento.DataInicio);
                    const dataFimFormatada = formatarDataHora(atendimento.DataFim);

                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td class="nome-cell"><strong>${atendimento.NomeCuidador || '-'}</strong></td>
                        <td class="email-cell">${atendimento.NomeIdoso || '-'}</td>
                        <td class="telefone-cell">${atendimento.NomeResponsavel || '-'}</td>
                        <td class="idade-cell">${dataInicioFormatada}</td>
                        <td class="biografia-cell">${dataFimFormatada !== '-' ? dataFimFormatada : 'Nenhuma'}</td>
                        <td class="status-cell">${atendimento.Status || 'Nenhuma'}</td>
                        <td class="local-cell">${atendimento.Local || 'Nenhuma'}</td>
                        <td class="valor-cell">${atendimento.Valor || 'Nenhuma'}</td>
                        <td class="obs-cell">${atendimento.ObservacaoExtra || 'Nenhuma'}</td>
                        <td class="acoes-cell">
                            <button class="btn-excluir" data-id="${atendimento.IdCuidador}">Cancelar</button>
                        </td>
                        `;
                    tabelaBody.appendChild(tr);
                });

                configurarBotoesExcluir();
            })
            .catch(error => {
                console.error(error);
                const tabelaBody = document.querySelector('.atendimento-table tbody');
                tabelaBody.innerHTML = `
                  <tr>
                    <td colspan="10" style="text-align: center; color: red;">Erro ao carregar os dados dos atendimentos.</td>
                  </tr>`;
            });
    }

    function configurarBotoesExcluir() {
        document.querySelectorAll('.btn-excluir').forEach(botao => {
            botao.addEventListener('click', async () => {
                const id = botao.getAttribute('data-id');
                if (confirm('Deseja realmente excluir este atendimento?')) {
                    try {
                        const response = await fetch(`/api/atendimento/${id}`, {
                            method: 'DELETE'
                        });
                        if (!response.ok) throw new Error('Erro ao excluir');
                        carregarAtendimentos();
                    } catch (error) {
                        alert('Erro ao excluir atendimento. Tente novamente.');
                        console.error(error);
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