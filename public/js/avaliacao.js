// public/js/avaliacao.js

// Variáveis globais
let avaliacoes = [];
let atendimentosDisponiveis = [];
let filtroAtual = 'all';

const formatarCampo = (valor, fallback = 'Não informado') => {
    if (valor === null || valor === undefined) return fallback;
    const texto = String(valor).trim();
    return texto.length > 0 ? texto : fallback;
};

const formatarDataHora = (dataHora) => {
    if (!dataHora) return 'Não informado';
    const data = new Date(dataHora);
    if (Number.isNaN(data.getTime())) return 'Não informado';
    return data.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

// Função para carregar estatísticas
async function carregarEstatisticas() {
    try {
        const data = await apiFetch('/api/avaliacao/estatisticas', {}, {
            suppressDefaultError: true,
            parseJson: true
        });

        const stats = data?.data || data || {};
        const totalAvaliacoesEl = document.getElementById('totalAvaliacoes');
        const mediaGeralEl = document.getElementById('mediaGeral');
        const avaliacoesPositivasEl = document.getElementById('avaliacoesPositivas');
        const avaliacoesNegativasEl = document.getElementById('avaliacoesNegativas');

        if (totalAvaliacoesEl) {
            totalAvaliacoesEl.textContent = stats.TotalAvaliacoes || 0;
        }
        if (mediaGeralEl) {
            mediaGeralEl.textContent = (parseFloat(stats.MediaGeral) || 0).toFixed(1);
        }
        if (avaliacoesPositivasEl) {
            avaliacoesPositivasEl.textContent = stats.AvaliacoesPositivas || 0;
        }
        if (avaliacoesNegativasEl) {
            avaliacoesNegativasEl.textContent = stats.AvaliacoesNegativas || 0;
        }
    } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
        mostrarMensagemErro('Não foi possível carregar as estatísticas.');
        showDetailedError(error, 'Não foi possível carregar as estatísticas.');
    }
}

// Função para carregar todas as avaliações
async function carregarAvaliacoes() {
    try {
        const data = await apiFetch('/api/avaliacao', {}, {
            suppressDefaultError: true,
            parseJson: true
        });

        avaliacoes = Array.isArray(data?.data) ? data.data : data;
        exibirAvaliacoes(avaliacoes);
    } catch (error) {
        console.error('Erro na requisição:', error);
        exibirErro('Erro de conexão');
        mostrarMensagemErro('Erro de conexão ao carregar avaliações');
        showDetailedError(error, 'Erro de conexão ao carregar avaliações');
    }
}

// Função para exibir avaliações na lista
function exibirAvaliacoes(avaliacoesParaExibir) {
    const container = document.getElementById('avaliacoesList');
    
    if (!container) {
        console.error('Container de avaliações não encontrado');
        return;
    }
    
    if (avaliacoesParaExibir.length === 0) {
        container.innerHTML = `
            <div class="loading">
                <i class="fas fa-star"></i>
                <span>Nenhuma avaliação registrada ainda.</span>
            </div>
        `;
        return;
    }
    
    container.innerHTML = avaliacoesParaExibir.map(avaliacao => {
        const dataFormatada = formatarDataHora(avaliacao.DataAvaliacao);
        const estrelas = gerarEstrelas(avaliacao.Nota);
        
        return `
            <div class="avaliacao-card" data-nota="${avaliacao.Nota}">
                <div class="avaliacao-header">
                    <div class="avaliacao-info">
                        <h3>${formatarCampo(avaliacao.NomeCuidador, 'Cuidador não informado')}</h3>
                        <div class="avaliacao-meta">
                            <span><i class="fas fa-user"></i> ${formatarCampo(avaliacao.NomeResponsavel, 'Responsável não informado')}</span>
                            <span><i class="fas fa-calendar"></i> ${dataFormatada}</span>
                            <span><i class="fas fa-user-friends"></i> ${formatarCampo(avaliacao.NomeIdoso, 'Idoso não informado')}</span>
                        </div>
                        <div class="rating">
                            ${estrelas}
                        </div>
                    </div>
                    <div class="avaliacao-actions">
                        <button class="btn-action btn-edit" onclick="editarAvaliacao(${avaliacao.IdAvaliacao})" title="Editar avaliação">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-action btn-delete" onclick="excluirAvaliacao(${avaliacao.IdAvaliacao})" title="Excluir avaliação">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                ${avaliacao.Comentario ? `
                    <div class="avaliacao-comentario">
                        <p>${avaliacao.Comentario}</p>
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');
}

// Função para gerar estrelas baseadas na nota
function gerarEstrelas(nota) {
    let estrelas = '';
    for (let i = 1; i <= 5; i++) {
        const classe = i <= nota ? 'star filled' : 'star';
        estrelas += `<i class="fas fa-star ${classe}"></i>`;
    }
    return estrelas;
}

// Função para exibir erro
function exibirErro(mensagem) {
    const container = document.getElementById('avaliacoesList');
    if (container) {
        container.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                ${mensagem}
            </div>
        `;
    }
}

// Função para buscar avaliações
function buscarAvaliacoes(termo) {
    const termoLower = termo.toLowerCase();
    const avaliacoesFiltradas = avaliacoes.filter(avaliacao => {
        const nomeCuidador = (avaliacao.NomeCuidador || '').toLowerCase();
        const nomeResponsavel = (avaliacao.NomeResponsavel || '').toLowerCase();
        const comentario = (avaliacao.Comentario || '').toLowerCase();
        
        return nomeCuidador.includes(termoLower) || 
               nomeResponsavel.includes(termoLower) || 
               comentario.includes(termoLower);
    });
    
    exibirAvaliacoes(avaliacoesFiltradas);
}

// Função para filtrar por nota
function filtrarPorNota(nota) {
    filtroAtual = nota;
    
    // Atualizar botões de filtro
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-filter="${nota}"]`).classList.add('active');
    
    let avaliacoesFiltradas = avaliacoes;
    
    if (nota !== 'all') {
        avaliacoesFiltradas = avaliacoes.filter(avaliacao => avaliacao.Nota == nota);
    }
    
    // Aplicar busca também se houver termo de busca
    const termoBusca = document.getElementById('searchInput').value;
    if (termoBusca) {
        const termoLower = termoBusca.toLowerCase();
        avaliacoesFiltradas = avaliacoesFiltradas.filter(avaliacao => {
            const nomeCuidador = (avaliacao.NomeCuidador || '').toLowerCase();
            const nomeResponsavel = (avaliacao.NomeResponsavel || '').toLowerCase();
            const comentario = (avaliacao.Comentario || '').toLowerCase();
            
            return nomeCuidador.includes(termoLower) || 
                   nomeResponsavel.includes(termoLower) || 
                   comentario.includes(termoLower);
        });
    }
    
    exibirAvaliacoes(avaliacoesFiltradas);
}

// Função para abrir modal de nova avaliação
async function abrirModalNovaAvaliacao() {
    await carregarAtendimentosDisponiveis();
    document.getElementById('modalNovaAvaliacao').style.display = 'block';
}

// Função para fechar modal de nova avaliação
function fecharModalNovaAvaliacao() {
    document.getElementById('modalNovaAvaliacao').style.display = 'none';
    document.getElementById('formNovaAvaliacao').reset();
}

// Função para carregar atendimentos disponíveis para avaliação
async function carregarAtendimentosDisponiveis() {
    try {
        // Por enquanto, vamos usar um ID fixo. Em uma implementação real,
        // você pegaria o ID do responsável logado da sessão
        const data = await apiFetch('/api/avaliacao/atendimentos/1', {}, {
            suppressDefaultError: true,
            parseJson: true
        }); // ID fixo para exemplo

        atendimentosDisponiveis = Array.isArray(data?.data) ? data.data : data;
        const select = document.getElementById('atendimentoSelect');
        if (!select) return;
        select.innerHTML = '<option value="">Selecione um atendimento...</option>';

        atendimentosDisponiveis.forEach(atendimento => {
            const option = document.createElement('option');
            option.value = atendimento.IdAtendimento;
            option.textContent = `${atendimento.NomeCuidador} - ${atendimento.NomeIdoso} (${formatarDataHora(atendimento.DataFim)})`;
            if (atendimento.JaAvaliado) {
                option.textContent += ' - Já avaliado';
                option.disabled = true;
            }
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Erro na requisição de atendimentos:', error);
        mostrarMensagemErro('Erro de conexão ao carregar atendimentos.');
        showDetailedError(error, 'Erro de conexão ao carregar atendimentos.');
    }
}

// Função para salvar nova avaliação
async function salvarNovaAvaliacao(event) {
    event.preventDefault();
    const form = event.target;
    const submitButton = form.querySelector('button[type="submit"]');

    const camposFormulario = [
        {
            field: form.querySelector('#atendimentoSelect'),
            name: 'Atendimento',
            rules: { required: true }
        },
        {
            field: form.querySelector('input[name="Nota"]'),
            name: 'Nota',
            getValue: () => form.querySelector('input[name="Nota"]:checked')?.value || '',
            rules: { required: true }
        },
        {
            field: form.querySelector('textarea[name="Comentario"]'),
            name: 'Comentário',
            rules: { maxLength: 500 }
        }
    ];

    const validacao = validateFields(camposFormulario);
    if (!validacao.valid) {
        const mensagem = ['Corrija os campos destacados antes de salvar:', ...validacao.messages.map((msg) => `• ${msg}`)].join('\n');
        showToast(mensagem, 'error');
        return;
    }
    
    const formData = new FormData(form);
    const dados = {
        IdResponsavel: 1, // ID fixo para exemplo
        IdCuidador: 1, // Seria obtido do atendimento selecionado
        IdAtendimento: formData.get('IdAtendimento'),
        Nota: parseInt(formData.get('Nota')),
        Comentario: formData.get('Comentario')
    };
    
    try {
        const resultado = await apiFetch('/api/avaliacao', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dados)
        }, {
            button: submitButton,
            loadingButtonText: 'Salvando...',
            suppressDefaultError: true,
            parseJson: true
        });

        mostrarMensagemSucesso(resultado?.message || 'Avaliação criada com sucesso!');
        fecharModalNovaAvaliacao();
        carregarAvaliacoes();
        carregarEstatisticas();
    } catch (error) {
        console.error('Erro ao salvar avaliação:', error);
        mostrarMensagemErro(error.message || 'Erro ao salvar avaliação.');
        showDetailedError(error, 'Erro ao salvar avaliação. Verifique as informações e tente novamente.');
    }
}

// Função para editar avaliação
async function editarAvaliacao(idAvaliacao) {
    const avaliacao = avaliacoes.find(a => a.IdAvaliacao == idAvaliacao);
    if (!avaliacao) return;
    
    // Preencher o formulário de edição
    document.getElementById('editIdAvaliacao').value = idAvaliacao;
    document.getElementById('editComentario').value = avaliacao.Comentario || '';
    
    // Marcar a nota atual
    document.querySelectorAll('#formEditarAvaliacao input[name="Nota"]').forEach(input => {
        input.checked = input.value == avaliacao.Nota;
    });
    
    document.getElementById('modalEditarAvaliacao').style.display = 'block';
}

// Função para fechar modal de edição
function fecharModalEditarAvaliacao() {
    document.getElementById('modalEditarAvaliacao').style.display = 'none';
    document.getElementById('formEditarAvaliacao').reset();
}

// Função para atualizar avaliação
async function atualizarAvaliacao(event) {
    event.preventDefault();
    const form = event.target;
    const submitButton = form.querySelector('button[type="submit"]');

    const camposFormulario = [
        {
            field: form.querySelector('input[name="Nota"]'),
            name: 'Nota',
            getValue: () => form.querySelector('input[name="Nota"]:checked')?.value || '',
            rules: { required: true }
        },
        {
            field: form.querySelector('textarea[name="Comentario"]'),
            name: 'Comentário',
            rules: { maxLength: 500 }
        }
    ];

    const validacao = validateFields(camposFormulario);
    if (!validacao.valid) {
        const mensagem = ['Corrija os campos destacados antes de salvar:', ...validacao.messages.map((msg) => `• ${msg}`)].join('\n');
        showToast(mensagem, 'error');
        return;
    }
    
    const formData = new FormData(form);
    const idAvaliacao = formData.get('IdAvaliacao');
    const dados = {
        Nota: parseInt(formData.get('Nota')),
        Comentario: formData.get('Comentario')
    };
    
    try {
        const resultado = await apiFetch(`/api/avaliacao/${idAvaliacao}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dados)
        }, {
            button: submitButton,
            loadingButtonText: 'Atualizando...',
            suppressDefaultError: true,
            parseJson: true
        });

        mostrarMensagemSucesso(resultado?.message || 'Avaliação atualizada com sucesso!');
        fecharModalEditarAvaliacao();
        carregarAvaliacoes();
        carregarEstatisticas();
    } catch (error) {
        console.error('Erro ao atualizar avaliação:', error);
        mostrarMensagemErro(error.message || 'Erro ao atualizar avaliação.');
        showDetailedError(error, 'Erro ao atualizar avaliação.');
    }
}

// Função para excluir avaliação
async function excluirAvaliacao(idAvaliacao) {
    // Mensagem de aviso detalhada
    const mensagemAviso = `⚠️ ATENÇÃO - EXCLUSÃO PERMANENTE ⚠️\n\n` +
        `Você está prestes a excluir esta avaliação.\n\n` +
        `⚠️ ESTA AÇÃO NÃO PODE SER DESFEITA! ⚠️\n\n` +
        `Deseja realmente continuar?`;
    
    if (!confirm(mensagemAviso)) {
        return;
    }
    
    try {
        await apiFetch(`/api/avaliacao/${idAvaliacao}`, {
            method: 'DELETE'
        }, {
            loadingMessage: 'Excluindo avaliação...',
            successMessage: 'Avaliação excluída com sucesso!',
            suppressDefaultError: true,
            parseJson: true
        });
        carregarAvaliacoes();
        carregarEstatisticas();
    } catch (error) {
        console.error('Erro ao excluir avaliação:', error);
        mostrarMensagemErro(error.message || 'Erro ao excluir avaliação.');
        showDetailedError(error, 'Erro ao excluir avaliação.');
    }
}

// Função para mostrar mensagem de sucesso
function mostrarMensagemSucesso(mensagem) {
    showToast(mensagem, 'success');
}

// Função para mostrar mensagem de erro
function mostrarMensagemErro(mensagem) {
    showToast(mensagem, 'error');
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Carregar dados iniciais
    carregarAvaliacoes();
    carregarEstatisticas();
    
    // Event listener para busca
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            buscarAvaliacoes(e.target.value);
        });
    }
    
    // Event listeners para filtros
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            filtrarPorNota(e.target.dataset.filter);
        });
    });
    
    // Event listeners para formulários
    const formNovaAvaliacao = document.getElementById('formNovaAvaliacao');
    if (formNovaAvaliacao) {
        const camposNova = [
            {
                field: formNovaAvaliacao.querySelector('#atendimentoSelect'),
                name: 'Atendimento',
                rules: { required: true }
            },
            {
                field: formNovaAvaliacao.querySelector('input[name="Nota"]'),
                name: 'Nota',
                getValue: () => formNovaAvaliacao.querySelector('input[name="Nota"]:checked')?.value || '',
                rules: { required: true }
            },
            {
                field: formNovaAvaliacao.querySelector('textarea[name="Comentario"]'),
                name: 'Comentário',
                rules: { maxLength: 500 }
            }
        ];

        attachValidationListeners(camposNova);
        formNovaAvaliacao.addEventListener('submit', salvarNovaAvaliacao);
    }
    
    const formEditarAvaliacao = document.getElementById('formEditarAvaliacao');
    if (formEditarAvaliacao) {
        const camposEditar = [
            {
                field: formEditarAvaliacao.querySelector('input[name="Nota"]'),
                name: 'Nota',
                getValue: () => formEditarAvaliacao.querySelector('input[name="Nota"]:checked')?.value || '',
                rules: { required: true }
            },
            {
                field: formEditarAvaliacao.querySelector('textarea[name="Comentario"]'),
                name: 'Comentário',
                rules: { maxLength: 500 }
            }
        ];

        attachValidationListeners(camposEditar);
        formEditarAvaliacao.addEventListener('submit', atualizarAvaliacao);
    }
    
    // Fechar modais ao clicar fora
    window.addEventListener('click', (e) => {
        const modalNova = document.getElementById('modalNovaAvaliacao');
        const modalEditar = document.getElementById('modalEditarAvaliacao');
        
        if (e.target === modalNova) {
            fecharModalNovaAvaliacao();
        }
        if (e.target === modalEditar) {
            fecharModalEditarAvaliacao();
        }
    });
});
