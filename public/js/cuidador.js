document.addEventListener('DOMContentLoaded', () => {
    const cardGrid = document.querySelector('.card-grid');
    const form = document.getElementById('formCuidador');
    const modalOverlay = document.getElementById("modalOverlay");

    const formatarCampo = (valor, textoFallback = 'Não informado') => {
        if (valor === null || valor === undefined) return textoFallback;
        const texto = String(valor).trim();
        return texto.length > 0 ? texto : textoFallback;
    };

    const formatarTelefone = (telefone) => {
        const apenasDigitos = (telefone || '').replace(/\D/g, '');
        if (apenasDigitos.length === 10) {
            return apenasDigitos.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
        }
        if (apenasDigitos.length === 11) {
            return apenasDigitos.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
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

    async function carregarCuidadores(mostrarAviso = false) {
        const tabelaBody = document.querySelector('.cuidadores-table tbody');
        if (!tabelaBody) return;

        tabelaBody.innerHTML = `
            <tr>
              <td colspan="8" style="text-align: center;">Carregando cuidadores...</td>
            </tr>`;

        try {
            const resultado = await apiFetch('/api/cuidador', {}, {
                suppressDefaultError: true,
                parseJson: true
            });

            const cuidadores = Array.isArray(resultado?.data) ? resultado.data : resultado;

            tabelaBody.innerHTML = '';

            if (!Array.isArray(cuidadores) || cuidadores.length === 0) {
                tabelaBody.innerHTML = `
                    <tr>
                      <td colspan="8" style="text-align: center;">Nenhum cuidador cadastrado.</td>
                    </tr>`;
                if (mostrarAviso) {
                    showToast('Nenhum cuidador encontrado.', 'info');
                }
                return;
            }

            cuidadores.forEach((cuidador) => {
                const avatarPadrao = '/avatar/cuidador.png';
                const fotoUrl = cuidador.FotoUrl && cuidador.FotoUrl.trim() !== '' ? cuidador.FotoUrl : avatarPadrao;

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td class="foto-cell">
                      <img src="${fotoUrl}" alt="Foto de ${formatarCampo(cuidador.Nome, 'Cuidador')}" class="foto-cuidador" />
                    </td>
                    <td class="nome-cell"><strong>${formatarCampo(cuidador.Nome, 'Cuidador')}</strong></td>
                    <td class="email-cell">${formatarCampo(cuidador.Email, 'Não informado')}</td>
                    <td class="telefone-cell">${formatarTelefone(cuidador.Telefone)}</td>
                    <td class="idade-cell">${calcularIdade(cuidador.DataNascimento)}</td>
                    <td class="biografia-cell">${formatarCampo(cuidador.Biografia, 'Sem biografia informada')}</td>
                    <td class="status-cell">
                      Fumante: ${formatarCampo(cuidador.Fumante, 'Não')} <br>
                      Filhos: ${formatarCampo(cuidador.TemFilhos, 'Não')} <br>
                      CNH: ${formatarCampo(cuidador.PossuiCNH, 'Não')} <br>
                      Carro: ${formatarCampo(cuidador.TemCarro, 'Não')}
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

            if (mostrarAviso) {
                showToast('Lista de cuidadores atualizada.', 'success');
            }
        } catch (error) {
            console.error('Erro ao carregar cuidadores:', error);
            tabelaBody.innerHTML = `
              <tr>
                <td colspan="8" style="text-align: center; color: #e74c3c;">Não foi possível carregar os dados dos cuidadores.</td>
              </tr>`;
            if (error?.message) {
                showDetailedError(error, 'Não foi possível carregar os cuidadores. Tente novamente.');
            }
        }
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
                        await apiFetch(`/api/cuidador/${id}`, {
                            method: 'DELETE'
                        }, {
                            loadingMessage: `Excluindo ${nomeCuidador}...`,
                            successMessage: `${nomeCuidador} foi excluído permanentemente.`,
                            suppressDefaultError: true,
                            parseJson: true
                        });
                        carregarCuidadores(true);
                    } catch (error) {
                        console.error(error);
                        showDetailedError(error, 'Erro ao excluir cuidador. Verifique se ele possui vínculos e tente novamente.');
                    }
                }
            });
        });
    }

    // Submissão do formulário
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
                        const urlValida = /^(https?:\/\/|\/)/i.test(valor);
                        return urlValida || 'Informe uma URL válida ou deixe em branco para usar o avatar padrão.';
                    }
                }
            }
        ];

        attachValidationListeners(camposFormulario);

        const submitButton = form.querySelector('.btn-save');
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
                Email: form.email.value.trim(),
                Telefone: form.telefone.value.trim(),
                DataNascimento: form.dataNascimento.value,
                FotoUrl: normalizarUrlOpcional(form.fotoUrl.value),
                Biografia: form.biografia.value.trim(),
                Fumante: form.fumante.value,
                TemFilhos: form.temFilhos.value,
                PossuiCNH: form.possuiCNH.value,
                TemCarro: form.temCarro.value
            };

            const url = idEditando ? `/api/cuidador/${idEditando}` : '/api/cuidador';
            const metodo = idEditando ? 'PUT' : 'POST';

            try {
                await apiFetch(url, {
                    method: metodo,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(dados)
                }, {
                    button: submitButton,
                    loadingButtonText: idEditando ? 'Atualizando...' : 'Salvando...',
                    successMessage: idEditando ? 'Cuidador atualizado com sucesso.' : 'Cuidador cadastrado com sucesso.',
                    suppressDefaultError: true,
                    parseJson: true
                });

                form.reset();
                form.removeAttribute('data-edit-id');
                modalOverlay.classList.remove('active');
                carregarCuidadores(true);
            } catch (error) {
                console.error(error);
                showDetailedError(error, 'Erro ao salvar cuidador. Verifique os dados informados.');
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
