document.addEventListener('DOMContentLoaded', () => {
    const cardGrid = document.querySelector('.card-grid');
    const form = document.getElementById('formIdoso');
    const selectResponsavel = document.getElementById('idResponsavel');
    const selectMobilidade = document.getElementById('idMobilidade');
    const selectNivelAutonomia = document.getElementById('idNivelAutonomia');
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

    function carregarIdosos() {
        fetch('/api/idosos')
            .then(response => {
                if (!response.ok) throw new Error('Erro ao buscar idosos');
                return response.json();
            })
            .then(result => {
                // Verificar se a resposta tem o formato { success: true, data: [...] }
                const idosos = result.success ? result.data : result;
                const tabelaBody = document.querySelector('.idosos-table tbody');
                tabelaBody.innerHTML = '';

                if (!idosos || idosos.length === 0) {
                    tabelaBody.innerHTML = `
                <tr>
                  <td colspan="7" style="text-align: center;">Nenhum idoso cadastrado.</td>
                </tr>`;
                    return;
                }

                idosos.forEach(item => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                <td class="foto-cell">
                  <img src="${item.FotoUrl || '/images/default-idoso.jpg'}" alt="Foto de ${item.Nome}" class="foto-idoso" />
                </td>
                <td class="nome-cell"><strong>${item.Nome}</strong></td>
                <td class="idade-cell">${calcularIdade(item.DataNascimento)} anos</td>
                <td class="sexo-cell">${item.Sexo}</td>
                <td class="condicoes-cell">
                  <strong>Cuidados:</strong> ${item.CuidadosMedicos || 'Nenhum'}<br>
                  <strong>Descrição:</strong> ${item.DescricaoExtra || 'Nenhuma'}
                </td>
                <td class="idade-cell">${calcularIdade(item.DataNascimento)} anos</td>
                <td class="acoes-cell">
                  <button class="btn-ver-responsavel" data-id="${item.IdResponsavel}">Ver Responsável</button>
                  <button class="btn-editar" data-idoso='${JSON.stringify(item)}'>Editar</button>
                  <button class="btn-excluir" data-id="${item.IdIdoso}">Excluir</button>
                </td>
              `;
                    tabelaBody.appendChild(tr);
                });

                configurarBotoesEditar();
                configurarBotoesExcluir();
            })
            .catch(error => {
                console.error(error);
                const tabelaBody = document.querySelector('.idosos-table tbody');
                tabelaBody.innerHTML = `
              <tr>
                <td colspan="7" style="text-align: center; color: red;">Erro ao carregar os dados dos idosos.</td>
              </tr>`;
            });
    }

    function popularSelect(selectElement, data, textoCampo, valorCampo) {
        selectElement.innerHTML = '<option value="">Selecione</option>';
        
        if (!data || !Array.isArray(data)) {
            console.warn('Dados inválidos para popularSelect:', data);
            return;
        }
        
        data.forEach(item => {
            const option = document.createElement('option');
            option.value = item[valorCampo];
            option.textContent = item[textoCampo];
            selectElement.appendChild(option);
        });
    }

    // Buscar responsáveis
    fetch('/api/responsaveis')
        .then(res => res.json())
        .then(result => {
            const data = result.success ? result.data : result;
            popularSelect(selectResponsavel, data, 'Nome', 'IdResponsavel');
        })
        .catch(err => {
            console.error(err);
            selectResponsavel.innerHTML = '<option value="">Erro ao carregar responsáveis</option>';
        });

    // Buscar mobilidades
    fetch('/api/mobilidades')
        .then(res => res.json())
        .then(result => {
            const data = result.success ? result.data : result;
            popularSelect(selectMobilidade, data, 'Descricao', 'IdMobilidade');
        })
        .catch(err => {
            console.error(err);
            selectMobilidade.innerHTML = '<option value="">Erro ao carregar mobilidades</option>';
        });

    // Buscar níveis de autonomia
    fetch('/api/niveis-autonomia')
        .then(res => res.json())
        .then(result => {
            const data = result.success ? result.data : result;
            popularSelect(selectNivelAutonomia, data, 'Descricao', 'IdNivelAutonomia');
        })
        .catch(err => {
            console.error(err);
            selectNivelAutonomia.innerHTML = '<option value="">Erro ao carregar níveis</option>';
        });

    // Preencher formulário para edição
    function configurarBotoesEditar() {
        document.querySelectorAll('.btn-editar').forEach(botao => {
            botao.addEventListener('click', () => {
                const idoso = JSON.parse(botao.getAttribute('data-idoso'));
                form.nome.value = idoso.Nome;
                form.dataNascimento.value = idoso.DataNascimento.split('T')[0];
                form.sexo.value = idoso.Sexo;
                form.cuidadosMedicos.value = idoso.CuidadosMedicos || '';
                form.descricaoExtra.value = idoso.DescricaoExtra || '';
                form.fotoUrl.value = idoso.FotoUrl || '';
                form.idResponsavel.value = idoso.IdResponsavel || '';
                form.idMobilidade.value = idoso.IdMobilidade || '';
                form.idNivelAutonomia.value = idoso.IdNivelAutonomia || '';

                form.setAttribute('data-edit-id', idoso.IdIdoso);
                modalOverlay.classList.add("active");
            });
        });
    }

    // Função para configurar botões excluir
    function configurarBotoesExcluir() {
        document.querySelectorAll('.btn-excluir').forEach(botao => {
            botao.addEventListener('click', async () => {
                const id = botao.getAttribute('data-id');
                if (confirm('Deseja realmente excluir este idoso?')) {
                    try {
                        const response = await fetch(`/api/idosos/${id}`, {
                            method: 'DELETE'
                        });
                        if (!response.ok) throw new Error('Erro ao excluir');
                        carregarIdosos();
                    } catch (error) {
                        alert('Erro ao excluir idoso. Tente novamente.');
                        console.error(error);
                    }
                }
            });
        });
    }

    if (form) {
        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            const idEditando = form.getAttribute('data-edit-id');

            const dados = {
                Nome: form.nome.value.trim(),
                DataNascimento: form.dataNascimento.value,
                Sexo: form.sexo.value,
                CuidadosMedicos: form.cuidadosMedicos.value.trim(),
                DescricaoExtra: form.descricaoExtra.value.trim(),
                FotoUrl: form.fotoUrl.value.trim(),
                IdResponsavel: form.idResponsavel.value,
                IdMobilidade: form.idMobilidade.value,
                IdNivelAutonomia: form.idNivelAutonomia.value
            };

            try {
                let response;
                if (idEditando) {
                    response = await fetch(`/api/idosos/${idEditando}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(dados)
                    });
                } else {
                    response = await fetch('/api/idosos', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(dados)
                    });
                }

                if (!response.ok) {
                    throw new Error('Erro ao salvar idoso');
                }

                form.reset();
                form.removeAttribute('data-edit-id');
                modalOverlay.classList.remove('active');
                carregarIdosos();
            } catch (error) {
                alert('Erro ao salvar idoso. Tente novamente.');
                console.error(error);
            }
        });
    }

    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            const termo = searchInput.value.toLowerCase();
            document.querySelectorAll('.idosos-table tbody tr').forEach(tr => {
                const nome = tr.querySelector('.nome-cell').textContent.toLowerCase();
                tr.style.display = nome.includes(termo) ? '' : 'none';
            });
        });
    }


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

    carregarIdosos();
});
