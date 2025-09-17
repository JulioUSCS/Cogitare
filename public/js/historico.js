// Função para carregar histórico
async function carregarHistorico() {
    try {
        const response = await fetch('/api/historico');
        const data = await response.json();
        
        if (data.success) {
            exibirHistorico(data.data);
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
function exibirHistorico(historico) {
    const tbody = document.querySelector('.historico-table tbody');
    
    if (!tbody) {
        console.error('Tabela não encontrada');
        return;
    }
    
    // Limpar conteúdo atual
    tbody.innerHTML = '';
    
    if (historico.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align:center; color: #666;">
                    Nenhum registro de histórico encontrado
                </td>
            </tr>
        `;
        return;
    }
    
    historico.forEach(registro => {
        const row = document.createElement('tr');
        const dataFormatada = formatarDataHora(registro.DataHora);
        
        row.innerHTML = `
            <td>${registro.IdHistorico}</td>
            <td>
                <span class="tipo-badge tipo-${registro.TipoHistorico.toLowerCase()}">
                    ${registro.TipoHistorico}
                </span>
            </td>
            <td>${registro.NomeResponsavel || 'N/A'}</td>
            <td>${registro.NomeCuidador || 'N/A'}</td>
            <td>${registro.NomeAdministrador || 'N/A'}</td>
            <td>
                <span class="acao-badge acao-${getClasseAcao(registro.Operacao)}">
                    ${registro.Operacao}
                </span>
            </td>
            <td>${dataFormatada}</td>
            <td>${registro.Observacoes || 'N/A'}</td>
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
                <td colspan="7" style="text-align:center; color: #dc3545;">
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
    const linhas = document.querySelectorAll('.historico-table tbody tr');
    
    linhas.forEach(linha => {
        const texto = linha.textContent.toLowerCase();
        const termoLower = termo.toLowerCase();
        
        if (texto.includes(termoLower)) {
            linha.style.display = '';
        } else {
            linha.style.display = 'none';
        }
    });
}

// Função para carregar contadores
async function carregarContadores() {
    try {
        // Carregar contadores de cada tipo
        const [adminRes, cuidadorRes, responsavelRes, atendimentoRes] = await Promise.all([
            fetch('/api/historico/administrador'),
            fetch('/api/historico/cuidador'),
            fetch('/api/historico/responsavel'),
            fetch('/api/historico/atendimento')
        ]);

        const [adminData, cuidadorData, responsavelData, atendimentoData] = await Promise.all([
            adminRes.json(),
            cuidadorRes.json(),
            responsavelRes.json(),
            atendimentoRes.json()
        ]);

        // Atualizar contadores
        document.getElementById('adminCount').textContent = adminData.success ? adminData.data.length : '0';
        document.getElementById('cuidadorCount').textContent = cuidadorData.success ? cuidadorData.data.length : '0';
        document.getElementById('responsavelCount').textContent = responsavelData.success ? responsavelData.data.length : '0';
        document.getElementById('atendimentoCount').textContent = atendimentoData.success ? atendimentoData.data.length : '0';

    } catch (error) {
        console.error('Erro ao carregar contadores:', error);
    }
}

// Carregar histórico quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    carregarHistorico();
    carregarContadores();
    
    // Adicionar evento de busca
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            buscarHistorico(e.target.value);
        });
    }
});