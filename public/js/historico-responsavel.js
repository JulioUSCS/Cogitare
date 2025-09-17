// Variáveis de paginação
let currentPage = 1;
const recordsPerPage = 50;
let totalRecords = 0;
let totalPages = 0;
let allRecords = [];

// Função para carregar histórico de responsáveis
async function carregarHistoricoResponsavel() {
    try {
        const response = await fetch('/api/historico/responsavel');
        const data = await response.json();
        
        if (data.success) {
            allRecords = data.data;
            totalRecords = allRecords.length;
            totalPages = Math.ceil(totalRecords / recordsPerPage);
            exibirHistoricoResponsavel();
            atualizarPaginacao();
        } else {
            console.error('Erro ao carregar histórico:', data.message);
            exibirErro('Erro ao carregar histórico');
        }
    } catch (error) {
        console.error('Erro na requisição:', error);
        exibirErro('Erro de conexão');
    }
}

// Função para exibir histórico na tabela
function exibirHistoricoResponsavel() {
    const tbody = document.querySelector('.historico-table tbody');
    
    if (!tbody) {
        console.error('Tabela não encontrada');
        return;
    }
    
    // Limpar conteúdo atual
    tbody.innerHTML = '';
    
    if (allRecords.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align:center; color: #666;">
                    Nenhum registro de histórico encontrado
                </td>
            </tr>
        `;
        return;
    }
    
    // Calcular registros para a página atual
    const startIndex = (currentPage - 1) * recordsPerPage;
    const endIndex = startIndex + recordsPerPage;
    const recordsToShow = allRecords.slice(startIndex, endIndex);
    
    recordsToShow.forEach(registro => {
        const row = document.createElement('tr');
        const dataFormatada = formatarDataHora(registro.DataHora);
        
        row.innerHTML = `
            <td>${registro.IdHistorico}</td>
            <td>${registro.NomeResponsavel || 'N/A'}</td>
            <td>
                <span class="acao-badge acao-${getClasseAcao(registro.Operacao)}">
                    ${registro.Operacao}
                </span>
            </td>
            <td>${dataFormatada}</td>
        `;
        tbody.appendChild(row);
    });
}

// Função para exibir erro
function exibirErro(mensagem) {
    const tbody = document.querySelector('.historico-table tbody');
    if (tbody) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align:center; color: #dc3545;">
                    ${mensagem}
                </td>
            </tr>
        `;
    }
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

// Função para obter classe CSS baseada na ação
function getClasseAcao(acao) {
    if (!acao) return 'outro';
    
    const acaoLower = acao.toLowerCase();
    
    if (acaoLower.includes('criar') || acaoLower.includes('cadastrar') || acaoLower.includes('adicionar')) {
        return 'criar';
    } else if (acaoLower.includes('atualizar') || acaoLower.includes('editar') || acaoLower.includes('modificar')) {
        return 'atualizar';
    } else if (acaoLower.includes('excluir') || acaoLower.includes('deletar') || acaoLower.includes('remover')) {
        return 'excluir';
    } else if (acaoLower.includes('login') || acaoLower.includes('entrar')) {
        return 'login';
    } else if (acaoLower.includes('logout') || acaoLower.includes('sair')) {
        return 'logout';
    } else {
        return 'outro';
    }
}

// Função para buscar histórico
function buscarHistorico(termo) {
    if (!termo.trim()) {
        // Se não há termo de busca, mostrar todos os registros
        allRecords = allRecords;
    } else {
        // Filtrar registros
        allRecords = allRecords.filter(registro => 
            registro.Operacao.toLowerCase().includes(termo.toLowerCase()) ||
            (registro.NomeResponsavel && registro.NomeResponsavel.toLowerCase().includes(termo.toLowerCase()))
        );
    }
    
    totalRecords = allRecords.length;
    totalPages = Math.ceil(totalRecords / recordsPerPage);
    currentPage = 1;
    
    exibirHistoricoResponsavel();
    atualizarPaginacao();
}

// Função para atualizar controles de paginação
function atualizarPaginacao() {
    const paginationInfo = document.getElementById('paginationInfo');
    const btnPrev = document.getElementById('btnPrev');
    const btnNext = document.getElementById('btnNext');
    const pageNumbers = document.getElementById('pageNumbers');
    
    if (paginationInfo) {
        const startRecord = (currentPage - 1) * recordsPerPage + 1;
        const endRecord = Math.min(currentPage * recordsPerPage, totalRecords);
        paginationInfo.textContent = `Mostrando ${startRecord}-${endRecord} de ${totalRecords} registros`;
    }
    
    if (btnPrev) {
        btnPrev.disabled = currentPage === 1;
    }
    
    if (btnNext) {
        btnNext.disabled = currentPage === totalPages || totalPages === 0;
    }
    
    if (pageNumbers) {
        pageNumbers.innerHTML = '';
        
        // Mostrar no máximo 5 números de página
        const maxVisiblePages = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
        
        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }
        
        for (let i = startPage; i <= endPage; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.className = `page-number ${i === currentPage ? 'active' : ''}`;
            pageBtn.textContent = i;
            pageBtn.addEventListener('click', () => irParaPagina(i));
            pageNumbers.appendChild(pageBtn);
        }
    }
}

// Função para ir para uma página específica
function irParaPagina(pagina) {
    if (pagina >= 1 && pagina <= totalPages) {
        currentPage = pagina;
        exibirHistoricoResponsavel();
        atualizarPaginacao();
    }
}

// Carregar histórico quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    carregarHistoricoResponsavel();
    
    // Adicionar evento de busca
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            buscarHistorico(e.target.value);
        });
    }
    
    // Adicionar eventos de paginação
    const btnPrev = document.getElementById('btnPrev');
    const btnNext = document.getElementById('btnNext');
    
    if (btnPrev) {
        btnPrev.addEventListener('click', () => {
            if (currentPage > 1) {
                irParaPagina(currentPage - 1);
            }
        });
    }
    
    if (btnNext) {
        btnNext.addEventListener('click', () => {
            if (currentPage < totalPages) {
                irParaPagina(currentPage + 1);
            }
        });
    }
});
