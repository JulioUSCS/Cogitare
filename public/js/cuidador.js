document.addEventListener('DOMContentLoaded', () => {
    const cardGrid = document.querySelector('.card-grid');
    const form = document.getElementById('formCuidador');
    const modalOverlay = document.getElementById("modalOverlay");

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

    function carregarCuidadores() {
        fetch('/api/cuidador')
            .then(response => {
                if (!response.ok) throw new Error('Erro ao buscar cuidadores');
                return response.json();
            })
            .then(result => {
                // Verificar se a resposta tem o formato { success: true, data: [...] }
                const cuidadores = result.success ? result.data : result;
                
                const tabelaBody = document.querySelector('.cuidadores-table tbody');
                tabelaBody.innerHTML = '';

                if (!cuidadores || cuidadores.length === 0) {
                    tabelaBody.innerHTML = `
                        <tr>
                          <td colspan="8" style="text-align: center;">Nenhum cuidador cadastrado.</td>
                        </tr>`;
                    return;
                }

                cuidadores.forEach(cuidador => {
                    // Usar imagem padrão local se não houver foto
                    const avatarPadrao = '/avatar/cuidador.png';
                    const fotoUrl = cuidador.FotoUrl && cuidador.FotoUrl.trim() !== '' ? cuidador.FotoUrl : avatarPadrao;
                    
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td class="foto-cell">
                          <img src="${fotoUrl}" alt="Foto de ${cuidador.Nome}" class="foto-cuidador" />
                        </td>
                        <td class="nome-cell"><strong>${cuidador.Nome}</strong></td>
                        <td class="email-cell">${cuidador.Email || '-'}</td>
                        <td class="telefone-cell">${cuidador.Telefone || '-'}</td>
                        <td class="idade-cell">${calcularIdade(cuidador.DataNascimento)} anos</td>
                        <td class="biografia-cell">${cuidador.Biografia || 'Nenhuma'}</td>
                        <td class="status-cell">
                          Fumante: ${cuidador.Fumante || 'Não'} <br>
                          Filhos: ${cuidador.TemFilhos || 'Não'} <br>
                          CNH: ${cuidador.PossuiCNH || 'Não'} <br>
                          Carro: ${cuidador.TemCarro || 'Não'}
                        </td>
                        <td class="acoes-cell">
                          <button class="btn-editar" data-cuidador='${JSON.stringify(cuidador)}'>Editar</button>
                          <button class="btn-excluir" data-id="${cuidador.IdCuidador}">Excluir</button>
                        </td>
                      `;
                    tabelaBody.appendChild(tr);
                });

                configurarBotoesEditar();
                configurarBotoesExcluir();
            })
            .catch(error => {
                console.error('Erro ao carregar cuidadores:', error);
                const tabelaBody = document.querySelector('.cuidadores-table tbody');
                tabelaBody.innerHTML = `
                  <tr>
                    <td colspan="8" style="text-align: center; color: red;">Erro ao carregar os dados dos cuidadores: ${error.message}</td>
                  </tr>`;
            });
    }

    // Preencher formulário para edição
    function configurarBotoesEditar() {
        document.querySelectorAll('.btn-editar').forEach(botao => {
            botao.addEventListener('click', () => {
                const cuidador = JSON.parse(botao.getAttribute('data-cuidador'));
                form.nome.value = cuidador.Nome;
                form.email.value = cuidador.Email || '';
                form.telefone.value = cuidador.Telefone || '';
                form.dataNascimento.value = cuidador.DataNascimento ? cuidador.DataNascimento.split('T')[0] : '';
                form.fotoUrl.value = cuidador.FotoUrl || '';
                form.biografia.value = cuidador.Biografia || '';
                form.fumante.value = cuidador.Fumante || 'Não';
                form.temFilhos.value = cuidador.TemFilhos || 'Não';
                form.possuiCNH.value = cuidador.PossuiCNH || 'Não';
                form.temCarro.value = cuidador.TemCarro || 'Não';

                form.setAttribute('data-edit-id', cuidador.IdCuidador);
                modalOverlay.classList.add("active");
            });
        });
    }

    // Configurar botões excluir
    function configurarBotoesExcluir() {
        document.querySelectorAll('.btn-excluir').forEach(botao => {
            botao.addEventListener('click', async () => {
                const id = botao.getAttribute('data-id');
                const nomeCuidador = botao.closest('tr').querySelector('.nome-cell').textContent.trim();
                
                // Mensagem de aviso detalhada
                const mensagemAviso = `⚠️ ATENÇÃO - EXCLUSÃO PERMANENTE ⚠️\n\n` +
                    `Você está prestes a excluir o cuidador: ${nomeCuidador}\n\n` +
                    `Esta ação poderá excluir PERMANENTEMENTE:\n` +
                    `• Todos os atendimentos realizados por este cuidador\n` +
                    `• Todas as avaliações recebidas\n` +
                    `• Histórico de comissões\n` +
                    `• Certificados e especialidades cadastradas\n` +
                    `• Disponibilidade e serviços oferecidos\n\n` +
                    `⚠️ ESTA AÇÃO NÃO PODE SER DESFEITA! ⚠️\n\n` +
                    `Deseja realmente continuar?`;
                
                if (confirm(mensagemAviso)) {
                    try {
                        const response = await fetch(`/api/cuidador/${id}`, {
                            method: 'DELETE'
                        });
                        
                        const data = await response.json();
                        
                        if (!response.ok) {
                            alert(`❌ Erro ao excluir:\n\n${data.error || data.erro || 'Erro desconhecido. Tente novamente.'}`);
                            return;
                        }
                        
                        alert(`✅ Sucesso!\n\n${nomeCuidador} foi excluído permanentemente.`);
                        carregarCuidadores();
                    } catch (error) {
                        alert('❌ Erro de conexão ao excluir cuidador. Verifique sua conexão e tente novamente.');
                        console.error(error);
                    }
                }
            });
        });
    }

    // Submissão do formulário
    if (form) {
        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            const idEditando = form.getAttribute('data-edit-id');

            const dados = {
                Nome: form.nome.value.trim(),
                Email: form.email.value.trim(),
                Telefone: form.telefone.value.trim(),
                DataNascimento: form.dataNascimento.value,
                FotoUrl: form.fotoUrl.value.trim(),
                Biografia: form.biografia.value.trim(),
                Fumante: form.fumante.value,
                TemFilhos: form.temFilhos.value,
                PossuiCNH: form.possuiCNH.value,
                TemCarro: form.temCarro.value
            };

            try {
                let response;
                if (idEditando) {
                    response = await fetch(`/api/cuidador/${idEditando}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(dados)
                    });
                } else {
                    response = await fetch('/api/cuidador', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(dados)
                    });
                }

                if (!response.ok) {
                    throw new Error('Erro ao salvar cuidador');
                }

                form.reset();
                form.removeAttribute('data-edit-id');
                modalOverlay.classList.remove('active');
                carregarCuidadores();
            } catch (error) {
                alert('Erro ao salvar cuidador. Tente novamente.');
                console.error(error);
            }
        });
    }

    // Pesquisa por nome
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            const termo = searchInput.value.toLowerCase();
            document.querySelectorAll('.cuidadores-table tbody tr').forEach(tr => {
                const nome = tr.querySelector('.nome-cell').textContent.toLowerCase();
                tr.style.display = nome.includes(termo) ? '' : 'none';
            });
        });
    }

    // Abrir e fechar modal
    const btnAbrir = document.getElementById("btnToggleForm");
    const btnFechar = document.getElementById("btnCloseModal");

    if (btnAbrir) {
        btnAbrir.addEventListener("click", () => {
            modalOverlay.classList.add("active");
        });
    }
    if (btnFechar) {
        btnFechar.addEventListener("click", () => {
            modalOverlay.classList.remove("active");
        });
    }

    modalOverlay.addEventListener("click", (e) => {
        if (e.target === modalOverlay) {
            modalOverlay.classList.remove("active");
        }
    });

    carregarCuidadores();
});
