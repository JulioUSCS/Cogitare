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

    const normalizarUrlOpcional = (valor) => {
        const texto = typeof valor === 'string' ? valor.trim() : '';
        return texto ? texto : null;
    };

    async function carregarIdosos(mostrarAviso = false) {
        const tabelaBody = document.querySelector('.idosos-table tbody');
        if (!tabelaBody) return;

        tabelaBody.innerHTML = `
            <tr>
              <td colspan="7" style="text-align: center;">Carregando idosos...</td>
            </tr>`;

        try {
            const resultado = await apiFetch('/api/idosos', {}, {
                suppressDefaultError: true,
                parseJson: true
            });
            const idosos = Array.isArray(resultado?.data) ? resultado.data : resultado;

            tabelaBody.innerHTML = '';

            if (!Array.isArray(idosos) || idosos.length === 0) {
                tabelaBody.innerHTML = `
                <tr>
                  <td colspan="7" style="text-align: center;">Nenhum idoso cadastrado.</td>
                </tr>`;
                if (mostrarAviso) {
                    showToast('Nenhum idoso encontrado.', 'info');
                }
                return;
            }

            idosos.forEach(item => {
                let avatarPadrao = '/avatar/idoso.png';
                if (item.Sexo && item.Sexo.toLowerCase() === 'feminino') {
                    avatarPadrao = '/avatar/idosa.png';
                }
                const fotoUrl = item.FotoUrl && item.FotoUrl.trim() !== '' ? item.FotoUrl : avatarPadrao;
                const responsavelNome = item.NomeResponsavel || 'Não informado';
                const responsavelContato = item.EmailResponsavel || item.TelefoneResponsavel || '';
 
                const tr = document.createElement('tr');
                tr.innerHTML = `
                <td class="foto-cell">
                  <img src="${fotoUrl}" alt="Foto de ${item.Nome}" class="foto-idoso" />
                </td>
                <td class="nome-cell"><strong>${item.Nome}</strong></td>
                <td class="idade-cell">${calcularIdade(item.DataNascimento)} anos</td>
                <td class="sexo-cell">${item.Sexo || 'Não informado'}</td>
                <td class="condicoes-cell">
                  <strong>Cuidados:</strong> ${item.CuidadosMedicos || 'Nenhum'}<br>
                  <strong>Descrição:</strong> ${item.DescricaoExtra || 'Nenhuma'}
                </td>
                <td class="responsavel-cell">
                  ${responsavelNome}
                  ${responsavelContato ? `<span class="tabela-subtexto">${responsavelContato}</span>` : ''}
                </td>
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

            if (mostrarAviso) {
                showToast('Lista de idosos atualizada.', 'success');
            }
        } catch (error) {
            console.error(error);
            tabelaBody.innerHTML = `
              <tr>
                <td colspan="7" style="text-align: center; color: #e74c3c;">Erro ao carregar os dados dos idosos.</td>
              </tr>`;
            showDetailedError(error, 'Não foi possível carregar os idosos. Tente novamente.');
        }
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

    async function carregarSelect(url, selectElement, textoCampo, valorCampo, mensagemErro) {
        if (!selectElement) return;
        selectElement.innerHTML = '<option value="">Carregando...</option>';
        try {
            const resultado = await apiFetch(url, {}, {
                suppressDefaultError: true,
                parseJson: true
            });
            const data = Array.isArray(resultado?.data) ? resultado.data : resultado;
            popularSelect(selectElement, data, textoCampo, valorCampo);
        } catch (err) {
            console.error(err);
            selectElement.innerHTML = `<option value="">${mensagemErro}</option>`;
            showDetailedError(err, mensagemErro);
        }
    }

    carregarSelect('/api/responsaveis', selectResponsavel, 'Nome', 'IdResponsavel', 'Erro ao carregar responsáveis');
    carregarSelect('/api/mobilidades', selectMobilidade, 'Descricao', 'IdMobilidade', 'Erro ao carregar mobilidades');
    carregarSelect('/api/niveis-autonomia', selectNivelAutonomia, 'Descricao', 'IdNivelAutonomia', 'Erro ao carregar níveis');

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
                const nomeIdoso = botao.closest('tr').querySelector('.nome-cell').textContent.trim();

                const mensagemAviso = `⚠️ ATENÇÃO - EXCLUSÃO PERMANENTE ⚠️\n\n` +
                    `Você está prestes a excluir o idoso: ${nomeIdoso}\n\n` +
                    `Esta ação irá excluir PERMANENTEMENTE:\n` +
                    `• Todos os atendimentos deste idoso\n` +
                    `• Todas as avaliações relacionadas\n` +
                    `• Todos os pagamentos e receitas\n` +
                    `• Todas as comissões geradas\n` +
                    `• Histórico completo de atendimentos\n` +
                    `• Doenças e restrições alimentares cadastradas\n\n` +
                    `⚠️ ESTA AÇÃO NÃO PODE SER DESFEITA! ⚠️\n\n` +
                    `Deseja realmente continuar?`;

                if (confirm(mensagemAviso)) {
                    try {
                        await apiFetch(`/api/idosos/${id}`, {
                            method: 'DELETE'
                        }, {
                            loadingMessage: `Excluindo ${nomeIdoso}...`,
                            successMessage: `${nomeIdoso} e todos os registros relacionados foram excluídos.`,
                            suppressDefaultError: true,
                            parseJson: true
                        });
                        carregarIdosos(true);
                    } catch (error) {
                        console.error(error);
                        showDetailedError(error, 'Erro ao excluir o idoso. Verifique vínculos existentes e tente novamente.');
                    }
                }
            });
        });
    }

    if (form) {
        const camposFormulario = [
            { field: form.nome, name: 'Nome completo', rules: { required: true, minLength: 3 } },
            {
                field: form.dataNascimento,
                name: 'Data de nascimento',
                rules: { required: true, date: true, future: false }
            },
            { field: form.sexo, name: 'Sexo', rules: { required: true } },
            {
                field: form.idResponsavel,
                name: 'Responsável vinculado',
                rules: { required: true }
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
            },
            {
                field: form.cuidadosMedicos,
                name: 'Cuidados médicos',
                rules: { maxLength: 500 }
            },
            {
                field: form.descricaoExtra,
                name: 'Descrição adicional',
                rules: { maxLength: 500 }
            }
        ];

        attachValidationListeners(camposFormulario);

        const submitButton = form.querySelector('button[type="submit"]');
        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            const idEditando = form.getAttribute('data-edit-id');

            const validacao = validateFields(camposFormulario);
            if (!validacao.valid) {
                const mensagem = ['Corrija os campos destacados antes de continuar:', ...validacao.messages.map((msg) => `• ${msg}`)].join('\n');
                showToast(mensagem, 'error');
                return;
            }

            const dados = {
                Nome: form.nome.value.trim(),
                DataNascimento: form.dataNascimento.value,
                Sexo: form.sexo.value,
                CuidadosMedicos: form.cuidadosMedicos.value.trim(),
                DescricaoExtra: form.descricaoExtra.value.trim(),
                FotoUrl: normalizarUrlOpcional(form.fotoUrl.value),
                IdResponsavel: form.idResponsavel.value,
                IdMobilidade: form.idMobilidade.value,
                IdNivelAutonomia: form.idNivelAutonomia.value
            };

            const url = idEditando ? `/api/idosos/${idEditando}` : '/api/idosos';
            const metodo = idEditando ? 'PUT' : 'POST';

            try {
                await apiFetch(url, {
                    method: metodo,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(dados)
                }, {
                    button: submitButton,
                    loadingButtonText: idEditando ? 'Atualizando...' : 'Salvando...',
                    successMessage: idEditando ? 'Idoso atualizado com sucesso.' : 'Idoso cadastrado com sucesso.',
                    suppressDefaultError: true,
                    parseJson: true
                });

                form.reset();
                form.removeAttribute('data-edit-id');
                modalOverlay.classList.remove('active');
                carregarIdosos(true);
            } catch (error) {
                console.error(error);
                showDetailedError(error, 'Erro ao salvar idoso. Verifique os dados informados.');
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
