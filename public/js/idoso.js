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
                if (!response.ok) {
                    throw new Error('Erro ao buscar idosos: ' + response.statusText);
                }
                return response.json();
            })
            .then(idosos => {
                cardGrid.innerHTML = '';
                if (idosos.length === 0) {
                    cardGrid.innerHTML = '<p>Nenhum idoso cadastrado.</p>';
                    return;
                }
                idosos.forEach(idoso => {
                    const card = document.createElement('div');
                    card.classList.add('card');
                    card.innerHTML = `
                        <img src="${idoso.FotoUrl || '/images/default-idoso.jpg'}" alt="Foto de ${idoso.Nome}" />
                        <div class="card-info">
                            <h3>${idoso.Nome || 'Nome não informado'}</h3>
                            <p>Idade: ${calcularIdade(idoso.DataNascimento)} anos</p>
                            <p>Descrição Extra: ${idoso.DescricaoExtra || 'Não informado'}</p>
                            <a href="/view/responsavel.html?id=${idoso.IdResponsavel}" class="link-responsavel">Ver Responsável</a>
                            <button class="btn-editar" data-idoso='${JSON.stringify(idoso)}'>Editar</button>
                            <button class="btn-excluir" data-id="${idoso.IdIdoso}">Excluir</button>
                        </div>
                    `;
                    cardGrid.appendChild(card);
                });

                configurarBotoesEditar();
                configurarBotoesExcluir();  // <- aqui
            })
            .catch(error => {
                cardGrid.innerHTML = `<p>Erro ao carregar os dados dos idosos.</p>`;
                console.error(error);
            });
    }

    function popularSelect(selectElement, data, textoCampo, valorCampo) {
        selectElement.innerHTML = '<option value="">Selecione</option>';
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
        .then(data => popularSelect(selectResponsavel, data, 'Nome', 'IdResponsavel'))
        .catch(err => {
            console.error(err);
            selectResponsavel.innerHTML = '<option value="">Erro ao carregar responsáveis</option>';
        });

    // Buscar mobilidades
    fetch('/api/mobilidades')
        .then(res => res.json())
        .then(data => popularSelect(selectMobilidade, data, 'Descricao', 'IdMobilidade'))
        .catch(err => {
            console.error(err);
            selectMobilidade.innerHTML = '<option value="">Erro ao carregar mobilidades</option>';
        });

    // Buscar níveis de autonomia
    fetch('/api/niveis-autonomia')
        .then(res => res.json())
        .then(data => popularSelect(selectNivelAutonomia, data, 'Descricao', 'IdNivelAutonomia'))
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
            document.querySelectorAll('.card-grid .card').forEach(card => {
                const nome = card.querySelector('h3').textContent.toLowerCase();
                card.style.display = nome.includes(termo) ? 'block' : 'none';
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
