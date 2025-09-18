// public/js/avaliacao.js

// Variáveis globais
let avaliacoes = [];
let atendimentosDisponiveis = [];
let filtroAtual = 'all';

// Função para carregar estatísticas
async function carregarEstatisticas() {
    try {
        const response = await fetch('/api/avaliacao/estatisticas');
        const data = await response.json();
        
        if (data.success) {
            const stats = data.data;
            console.log('Estatísticas recebidas:', stats);
            
            document.getElementById('totalAvaliacoes').textContent = stats.TotalAvaliacoes || 0;
            document.getElementById('mediaGeral').textContent = (parseFloat(stats.MediaGeral) || 0).toFixed(1);
            document.getElementById('avaliacoesPositivas').textContent = stats.AvaliacoesPositivas || 0;
            document.getElementById('avaliacoesNegativas').textContent = stats.AvaliacoesNegativas || 0;
        } else {
            console.error('Erro ao carregar estatísticas:', data.message);
        }
    } catch (error) {
        console.error('Erro na requisição de estatísticas:', error);
    }
}

// Função para carregar todas as avaliações
async function carregarAvaliacoes() {
    try {
        const response = await fetch('/api/avaliacao');
        const data = await response.json();
        
        if (data.success) {
            avaliacoes = data.data;
            exibirAvaliacoes(avaliacoes);
        } else {
            console.error('Erro ao carregar avaliações:', data.message);
            exibirErro('Erro ao carregar avaliações');
        }
    } catch (error) {
        console.error('Erro na requisição:', error);
        exibirErro('Erro de conexão');
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
                <span>Nenhuma avaliação encontrada</span>
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
                        <h3>${avaliacao.NomeCuidador || 'Cuidador não encontrado'}</h3>
                        <div class="avaliacao-meta">
                            <span><i class="fas fa-user"></i> ${avaliacao.NomeResponsavel || 'N/A'}</span>
                            <span><i class="fas fa-calendar"></i> ${dataFormatada}</span>
                            <span><i class="fas fa-user-friends"></i> ${avaliacao.NomeIdoso || 'N/A'}</span>
                        </div>
                        <div class="rating">
                            ${estrelas}
                        </div>
                    </div>
                    <div class="avaliacao-actions">
                        <button class="btn-action btn-edit" onclick="editarAvaliacao(${avaliacao.IdAvaliacao})" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-action btn-delete" onclick="excluirAvaliacao(${avaliacao.IdAvaliacao})" title="Excluir">
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

// Função para formatar data e hora
function formatarDataHora(dataHora) {
    if (!dataHora) return 'N/A';
    
    const data = new Date(dataHora);
    return data.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
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
        const response = await fetch('/api/avaliacao/atendimentos/1'); // ID fixo para exemplo
        const data = await response.json();
        
        if (data.success) {
            atendimentosDisponiveis = data.data;
            const select = document.getElementById('atendimentoSelect');
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
        } else {
            console.error('Erro ao carregar atendimentos:', data.message);
        }
    } catch (error) {
        console.error('Erro na requisição de atendimentos:', error);
    }
}

// Função para salvar nova avaliação
async function salvarNovaAvaliacao(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const dados = {
        IdResponsavel: 1, // ID fixo para exemplo
        IdCuidador: 1, // Seria obtido do atendimento selecionado
        IdAtendimento: formData.get('IdAtendimento'),
        Nota: parseInt(formData.get('Nota')),
        Comentario: formData.get('Comentario')
    };
    
    try {
        const response = await fetch('/api/avaliacao', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dados)
        });
        
        const result = await response.json();
        
        if (result.success) {
            mostrarMensagemSucesso('Avaliação criada com sucesso!');
            fecharModalNovaAvaliacao();
            carregarAvaliacoes();
            carregarEstatisticas();
        } else {
            mostrarMensagemErro(result.message);
        }
    } catch (error) {
        console.error('Erro ao salvar avaliação:', error);
        mostrarMensagemErro('Erro ao salvar avaliação');
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
    
    const formData = new FormData(event.target);
    const idAvaliacao = formData.get('IdAvaliacao');
    const dados = {
        Nota: parseInt(formData.get('Nota')),
        Comentario: formData.get('Comentario')
    };
    
    try {
        const response = await fetch(`/api/avaliacao/${idAvaliacao}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dados)
        });
        
        const result = await response.json();
        
        if (result.success) {
            mostrarMensagemSucesso('Avaliação atualizada com sucesso!');
            fecharModalEditarAvaliacao();
            carregarAvaliacoes();
            carregarEstatisticas();
        } else {
            mostrarMensagemErro(result.message);
        }
    } catch (error) {
        console.error('Erro ao atualizar avaliação:', error);
        mostrarMensagemErro('Erro ao atualizar avaliação');
    }
}

// Função para excluir avaliação
async function excluirAvaliacao(idAvaliacao) {
    if (!confirm('Tem certeza que deseja excluir esta avaliação?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/avaliacao/${idAvaliacao}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (result.success) {
            mostrarMensagemSucesso('Avaliação excluída com sucesso!');
            carregarAvaliacoes();
            carregarEstatisticas();
        } else {
            mostrarMensagemErro(result.message);
        }
    } catch (error) {
        console.error('Erro ao excluir avaliação:', error);
        mostrarMensagemErro('Erro ao excluir avaliação');
    }
}

// Função para mostrar mensagem de sucesso
function mostrarMensagemSucesso(mensagem) {
    const container = document.querySelector('.main-content');
    const div = document.createElement('div');
    div.className = 'success-message';
    div.innerHTML = `<i class="fas fa-check-circle"></i> ${mensagem}`;
    
    container.insertBefore(div, container.firstChild);
    
    setTimeout(() => {
        div.remove();
    }, 3000);
}

// Função para mostrar mensagem de erro
function mostrarMensagemErro(mensagem) {
    const container = document.querySelector('.main-content');
    const div = document.createElement('div');
    div.className = 'error-message';
    div.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${mensagem}`;
    
    container.insertBefore(div, container.firstChild);
    
    setTimeout(() => {
        div.remove();
    }, 5000);
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
        formNovaAvaliacao.addEventListener('submit', salvarNovaAvaliacao);
    }
    
    const formEditarAvaliacao = document.getElementById('formEditarAvaliacao');
    if (formEditarAvaliacao) {
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
