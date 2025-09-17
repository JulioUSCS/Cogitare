// Função para carregar pagamentos
async function carregarPagamentos() {
    try {
        const response = await fetch('/api/pagamentos');
        const result = await response.json();
        
        if (result.success) {
            exibirPagamentos(result.data);
        } else {
            console.error('Erro ao carregar pagamentos:', result.message);
            exibirMensagemErro('Erro ao carregar pagamentos');
        }
    } catch (error) {
        console.error('Erro na requisição:', error);
        exibirMensagemErro('Erro de conexão');
    }
}

// Função para exibir pagamentos na tabela
function exibirPagamentos(pagamentos) {
    const tbody = document.querySelector('.pagamentos-table tbody');
    
    if (!tbody) {
        console.error('Tabela não encontrada');
        return;
    }
    
    // Limpar conteúdo existente
    tbody.innerHTML = '';
    
    if (pagamentos.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 2rem; color: #666;">
                    Nenhum pagamento encontrado
                </td>
            </tr>
        `;
        return;
    }
    
    // Adicionar cada pagamento na tabela
    pagamentos.forEach(pagamento => {
        const row = document.createElement('tr');
        
        // Formatar data
        const dataFormatada = formatarData(pagamento.DataPagamento);
        
        // Formatar valor
        const valorFormatado = pagamento.Valor ? 
            `R$ ${parseFloat(pagamento.Valor).toFixed(2).replace('.', ',')}` : 
            'N/A';
        
        row.innerHTML = `
            <td>${pagamento.IdPagamento}</td>
            <td>${pagamento.IdAtendimento}</td>
            <td>${pagamento.MetodoPagamento}</td>
            <td>
                <span class="status-badge status-${pagamento.StatusPagamento.toLowerCase()}">
                    ${pagamento.StatusPagamento}
                </span>
            </td>
            <td>${dataFormatada}</td>
            <td>${pagamento.CodigoTransacao || 'N/A'}</td>
            <td>
                <button class="btn-action view" onclick="verPagamento(${pagamento.IdPagamento})" title="Ver detalhes">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn-action edit" onclick="editarPagamento(${pagamento.IdPagamento})" title="Editar">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-action delete" onclick="excluirPagamento(${pagamento.IdPagamento})" title="Excluir">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        tbody.appendChild(row);
    });
}

// Função para formatar data
function formatarData(data) {
    if (!data) return 'N/A';
    
    const dataObj = new Date(data);
    return dataObj.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Função para exibir mensagem de erro
function exibirMensagemErro(mensagem) {
    const tbody = document.querySelector('.pagamentos-table tbody');
    if (tbody) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 2rem; color: #e74c3c;">
                    ${mensagem}
                </td>
            </tr>
        `;
    }
}

// Função para buscar pagamentos
function buscarPagamentos(termo) {
    const tbody = document.querySelector('.pagamentos-table tbody');
    const linhas = tbody.querySelectorAll('tr');
    
    linhas.forEach(linha => {
        const texto = linha.textContent.toLowerCase();
        const termoBusca = termo.toLowerCase();
        
        if (texto.includes(termoBusca)) {
            linha.style.display = '';
        } else {
            linha.style.display = 'none';
        }
    });
}

// Função para ver pagamento
function verPagamento(id) {
    console.log('Ver pagamento:', id);
    // Implementar modal de visualização
    alert(`Visualizar pagamento ${id}`);
}

// Função para editar pagamento
function editarPagamento(id) {
    console.log('Editar pagamento:', id);
    // Implementar modal de edição
    alert(`Editar pagamento ${id}`);
}

// Função para excluir pagamento
function excluirPagamento(id) {
    if (confirm(`Tem certeza que deseja excluir o pagamento ${id}?`)) {
        console.log('Excluir pagamento:', id);
        // Implementar exclusão
        alert(`Pagamento ${id} excluído!`);
    }
}

// Carregar pagamentos quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    carregarPagamentos();
    
    // Adicionar evento de busca
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            buscarPagamentos(e.target.value);
        });
    }
    
    // Adicionar eventos do modal
    const btnToggleForm = document.getElementById('btnToggleForm');
    const modalOverlay = document.getElementById('modalOverlay');
    const btnCancel = document.getElementById('btnCancel');
    const formPagamento = document.getElementById('formPagamento');
    
    if (btnToggleForm) {
        btnToggleForm.addEventListener('click', () => {
            abrirModal();
        });
    }
    
    if (btnCancel) {
        btnCancel.addEventListener('click', () => {
            fecharModal();
        });
    }
    
    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                fecharModal();
            }
        });
    }
    
    if (formPagamento) {
        formPagamento.addEventListener('submit', (e) => {
            e.preventDefault();
            salvarPagamento();
        });
    }
});

// Função para abrir modal
function abrirModal() {
    const modalOverlay = document.getElementById('modalOverlay');
    const formTitle = document.getElementById('formTitle');
    const formPagamento = document.getElementById('formPagamento');
    
    if (modalOverlay) {
        modalOverlay.style.display = 'flex';
        formTitle.textContent = 'Cadastrar Pagamento';
        formPagamento.reset();
    }
}

// Função para fechar modal
function fecharModal() {
    const modalOverlay = document.getElementById('modalOverlay');
    if (modalOverlay) {
        modalOverlay.style.display = 'none';
    }
}

// Função para salvar pagamento
function salvarPagamento() {
    const formData = new FormData(document.getElementById('formPagamento'));
    const dadosPagamento = {
        IdAtendimento: formData.get('idAtendimento'),
        MetodoPagamento: formData.get('metodoPagamento'),
        StatusPagamento: formData.get('statusPagamento'),
        CodigoTransacao: formData.get('codigoTransacao')
    };
    
    console.log('Dados do pagamento:', dadosPagamento);
    // Aqui você implementaria a chamada para a API
    alert('Pagamento salvo com sucesso!');
    fecharModal();
    carregarPagamentos(); // Recarregar a lista
}
