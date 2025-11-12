// public/js/financeiro.js

// ========== TOOLTIPS DE CÁLCULO ==========

// Função para alternar tooltips
function toggleTooltip(tipo) {
    // Fechar todos os outros tooltips
    const allTooltips = document.querySelectorAll('.tooltip');
    allTooltips.forEach(tooltip => {
        if (tooltip.id !== `tooltip-${tipo}`) {
            tooltip.classList.remove('show');
        }
    });
    
    // Alternar o tooltip atual
    const tooltip = document.getElementById(`tooltip-${tipo}`);
    if (tooltip) {
        tooltip.classList.toggle('show');
    }
}

// Fechar tooltips ao clicar fora
document.addEventListener('click', function(event) {
    if (!event.target.closest('.help-btn') && !event.target.closest('.tooltip')) {
        const allTooltips = document.querySelectorAll('.tooltip');
        allTooltips.forEach(tooltip => {
            tooltip.classList.remove('show');
        });
    }
});

// Variáveis globais
let receitasChart = null;
let despesasChart = null;
let filtrosAtivos = {
    dataInicio: '',
    dataFim: ''
};

const normalizarNumero = (valor) => {
    if (valor === null || valor === undefined || valor === '') return 0;
    if (typeof valor === 'number') return Number.isFinite(valor) ? valor : 0;
    let texto = String(valor).trim();
    if (!texto) return 0;

    // Remover espaços
    texto = texto.replace(/\s/g, '');

    if (texto.includes(',') && texto.includes('.')) {
        // Formato tipo 1.234,56 → remover pontos e trocar vírgula por ponto
        texto = texto.replace(/\./g, '').replace(',', '.');
    } else if (texto.includes(',')) {
        // Formato tipo 123,45 → apenas trocar vírgula por ponto
        texto = texto.replace(',', '.');
    }

    const numero = Number(texto);
    return Number.isNaN(numero) ? 0 : numero;
};

const formatarMoeda = (valor) => {
    const numero = normalizarNumero(valor);
    return numero.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const formatarNumero = (valor, casas = 2) => {
    const numero = normalizarNumero(valor);
    return numero.toFixed(casas);
};

const formatarDataCurta = (dataStr) => {
    if (!dataStr) return 'Data não informada';
    const data = new Date(dataStr);
    if (Number.isNaN(data.getTime())) return 'Data não informada';
    return data.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
};

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    definirDatasPadrao();
    inicializarFinanceiro();
    configurarEventos();
});

// Inicializar sistema financeiro
async function inicializarFinanceiro() {
    try {
        mostrarCarregamento();
        
        // Carregar dados iniciais com tratamento de erros individual
        const resultados = await Promise.allSettled([
            carregarEstatisticasFinanceiras(),
            carregarReceitasPorMes(),
            carregarDespesasPorCategoria(),
            carregarCuidadoresRentaveis(),
            carregarInadimplencia(),
            carregarMetasFinanceiras(),
            carregarDadosParaFormularios()
        ]);
        
        // Verificar se houve falhas críticas
        const falhas = resultados.filter(result => result.status === 'rejected');
        if (falhas.length > 0) {
            console.warn('Algumas consultas falharam:', falhas);
        }
        
        // Verificar se há dados para exibir
        const temDados = await verificarSeTemDados();
        if (!temDados) {
            exibirMensagemSemDados();
        }
        
        removerCarregamento();
    } catch (error) {
        console.error('Erro ao inicializar financeiro:', error);
        exibirMensagemSemDados();
        removerCarregamento();
    }
}

// Configurar eventos
function configurarEventos() {
    // Formulário nova receita
    document.getElementById('formNovaReceita').addEventListener('submit', async function(e) {
        e.preventDefault();
        await criarNovaReceita();
    });
    
    // Formulário nova despesa
    document.getElementById('formNovaDespesa').addEventListener('submit', async function(e) {
        e.preventDefault();
        await criarNovaDespesa();
    });
    
    // Fechar modais ao clicar fora
    window.addEventListener('click', function(e) {
        const modalReceita = document.getElementById('modalNovaReceita');
        const modalDespesa = document.getElementById('modalNovaDespesa');
        
        if (e.target === modalReceita) {
            fecharModalNovaReceita();
        }
        if (e.target === modalDespesa) {
            fecharModalNovaDespesa();
        }
    });
}

// Definir datas padrão (mês atual)
function definirDatasPadrao() {
    const hoje = new Date();
    const primeiroDiaAno = new Date(hoje.getFullYear(), 0, 1);

    const dataInicio = document.getElementById('dataInicio');
    const dataFim = document.getElementById('dataFim');

    if (dataInicio) {
        dataInicio.value = primeiroDiaAno.toISOString().split('T')[0];
    }
    if (dataFim) {
        dataFim.value = hoje.toISOString().split('T')[0];
    }

    filtrosAtivos.dataInicio = primeiroDiaAno.toISOString().split('T')[0];
    filtrosAtivos.dataFim = hoje.toISOString().split('T')[0];
}

// Aplicar filtros
async function aplicarFiltros() {
    const dataInicio = document.getElementById('dataInicio').value;
    const dataFim = document.getElementById('dataFim').value;
     
    if (!dataInicio || !dataFim) {
        exibirErro('Por favor, selecione as datas de início e fim');
        return;
    }
    
    if (new Date(dataInicio) > new Date(dataFim)) {
        exibirErro('A data de início deve ser anterior à data de fim');
        return;
    }
    
    filtrosAtivos.dataInicio = dataInicio;
    filtrosAtivos.dataFim = dataFim;
    
    try {
        mostrarCarregamento();
        await carregarEstatisticasFinanceiras();
        await carregarDespesasPorCategoria();
        await carregarCuidadoresRentaveis();
        await carregarInadimplencia();
        removerCarregamento();
    } catch (error) {
        console.error('Erro ao aplicar filtros:', error);
        exibirErro('Erro ao aplicar filtros');
        removerCarregamento();
    }
}

// ========== CARREGAMENTO DE DADOS ==========

// Carregar estatísticas financeiras
async function carregarEstatisticasFinanceiras() {
    try {
        const response = await fetch(`/api/financeiro/estatisticas?dataInicio=${filtrosAtivos.dataInicio}&dataFim=${filtrosAtivos.dataFim}`);
        const result = await response.json();
        
        if (result.success) {
            console.log('[Financeiro] Estatísticas recebidas:', result.data);
            atualizarCardsEstatisticas(result.data);
        } else {
            console.warn('Erro ao carregar estatísticas:', result.message);
            // Não lançar erro, apenas logar
        }
    } catch (error) {
        console.warn('Erro ao carregar estatísticas:', error);
        // Não lançar erro, apenas logar
    }
}

// Carregar receitas por mês
async function carregarReceitasPorMes() {
    try {
        const response = await fetch('/api/financeiro/receitas-mes');
        const result = await response.json();
        
        if (result.success) {
            criarGraficoReceitas(result.data);
        } else {
            console.warn('Erro ao carregar receitas por mês:', result.message);
        }
    } catch (error) {
        console.warn('Erro ao carregar receitas por mês:', error);
    }
}

// Carregar despesas por categoria
async function carregarDespesasPorCategoria() {
    try {
        const response = await fetch(`/api/financeiro/despesas-categoria?dataInicio=${filtrosAtivos.dataInicio}&dataFim=${filtrosAtivos.dataFim}`);
        const result = await response.json();
        
        if (result.success) {
            criarGraficoDespesas(result.data);
        } else {
            console.warn('Erro ao carregar despesas por categoria:', result.message);
        }
    } catch (error) {
        console.warn('Erro ao carregar despesas por categoria:', error);
    }
}

// Carregar cuidadores mais rentáveis
async function carregarCuidadoresRentaveis() {
    try {
        const response = await fetch(`/api/financeiro/cuidadores-rentaveis?dataInicio=${filtrosAtivos.dataInicio}&dataFim=${filtrosAtivos.dataFim}`);
        const result = await response.json();
        
        if (result.success) {
            atualizarTabelaCuidadoresRentaveis(result.data);
        } else {
            console.warn('Erro ao carregar cuidadores rentáveis:', result.message);
        }
    } catch (error) {
        console.warn('Erro ao carregar cuidadores rentáveis:', error);
    }
}

// Carregar inadimplência
async function carregarInadimplencia() {
    try {
        // Só carregar inadimplência se há datas definidas
        if (!filtrosAtivos.dataInicio || !filtrosAtivos.dataFim) {
            return;
        }
        
        const response = await fetch(`/api/financeiro/inadimplencia-periodo?dataInicio=${filtrosAtivos.dataInicio}&dataFim=${filtrosAtivos.dataFim}`);
        const result = await response.json();
        
        if (result.success) {
            atualizarTabelaInadimplencia(result.data);
        } else {
            console.warn('Erro ao carregar inadimplência:', result.message);
        }
    } catch (error) {
        console.warn('Erro ao carregar inadimplência:', error);
    }
}

// Carregar metas financeiras
async function carregarMetasFinanceiras() {
    try {
        const response = await fetch('/api/financeiro/metas');
        const result = await response.json();
        
        if (result.success) {
            atualizarMetasFinanceiras(result.data);
        } else {
            console.warn('Erro ao carregar metas financeiras:', result.message);
        }
    } catch (error) {
        console.warn('Erro ao carregar metas financeiras:', error);
    }
}

// Carregar dados para formulários
async function carregarDadosParaFormularios() {
    try {
        // Carregar responsáveis
        const responsaveisResponse = await fetch('/api/resp');
        if (responsaveisResponse.ok) {
            const responsaveisResult = await responsaveisResponse.json();
            if (responsaveisResult.success) {
                atualizarSelectResponsaveis(responsaveisResult.data);
            }
        } else {
            console.warn('Erro ao carregar responsáveis:', responsaveisResponse.status);
        }
        
        // Carregar cuidadores
        const cuidadoresResponse = await fetch('/api/cuidador');
        if (cuidadoresResponse.ok) {
            const cuidadoresResult = await cuidadoresResponse.json();
            if (cuidadoresResult.success) {
                atualizarSelectCuidadores(cuidadoresResult.data);
            }
        } else {
            console.warn('Erro ao carregar cuidadores:', cuidadoresResponse.status);
        }
        
        // Carregar atendimentos
        const atendimentosResponse = await fetch('/api/atendimento');
        if (atendimentosResponse.ok) {
            const atendimentosResult = await atendimentosResponse.json();
            if (atendimentosResult.success) {
                atualizarSelectAtendimentos(atendimentosResult.data);
            }
        } else {
            console.warn('Erro ao carregar atendimentos:', atendimentosResponse.status);
        }
    } catch (error) {
        console.warn('Erro ao carregar dados para formulários:', error);
    }
}

// ========== ATUALIZAÇÃO DA INTERFACE ==========

// Atualizar cards de estatísticas
function atualizarCardsEstatisticas(dados) {
    console.log('[Financeiro] Atualizando cards com:', dados);
    // Atualizar cards existentes
    document.getElementById('totalReceitas').textContent = formatarMoeda(dados.ReceitaTotalEfetiva ?? dados.TotalReceitas ?? 0);
    document.getElementById('totalDespesas').textContent = formatarMoeda(dados.TotalDespesas ?? 0);
    document.getElementById('lucroLiquido').textContent = formatarMoeda(dados.LucroLiquido ?? 0);
    document.getElementById('margemLucro').textContent = `${formatarNumero(dados.MargemLucro ?? 0, 1)}%`;

    const totalReceitasSubtextoEl = document.getElementById('totalReceitasSubtexto');
    if (totalReceitasSubtextoEl) {
        totalReceitasSubtextoEl.textContent = `Resultados de ${dados.QtdReceitasEfetivas ?? dados.QtdReceitas ?? 0} recebimentos confirmados.`;
    }

    const totalDespesasSubtextoEl = document.getElementById('totalDespesasSubtexto');
    if (totalDespesasSubtextoEl) {
        totalDespesasSubtextoEl.textContent = `Inclui ${dados.QtdDespesas ?? 0} despesas registradas no período.`;
    }

    const lucroLiquidoSubtextoEl = document.getElementById('lucroLiquidoSubtexto');
    if (lucroLiquidoSubtextoEl) {
        lucroLiquidoSubtextoEl.textContent = `Receitas: ${formatarMoeda(dados.ReceitaTotalEfetiva ?? dados.TotalReceitas ?? 0)} • Despesas: ${formatarMoeda(dados.TotalDespesas ?? 0)}`;
    }

    const margemLucroSubtextoEl = document.getElementById('margemLucroSubtexto');
    if (margemLucroSubtextoEl) {
        margemLucroSubtextoEl.textContent = `Margem calculada sobre ${formatarMoeda(dados.ReceitaTotalEfetiva ?? dados.TotalReceitas ?? 0)} de receitas.`;
    }

    // Atualizar novos cards de vendas
    const totalVendasEl = document.getElementById('totalVendas');
    if (totalVendasEl) {
        totalVendasEl.textContent = formatarMoeda(dados.TotalVendas ?? 0);
    }

    const valorAReceberEl = document.getElementById('valorAReceber');
    if (valorAReceberEl) {
        valorAReceberEl.textContent = formatarMoeda(dados.ValorAReceber ?? 0);
    }

    const valorRecebidoEl = document.getElementById('valorRecebido');
    if (valorRecebidoEl) {
        valorRecebidoEl.textContent = formatarMoeda(dados.ValorRecebido ?? 0);
    }

    const totalAtendimentos = dados.QtdTotalAtendimentos ?? 0;
    const atendConcluidos = dados.QtdAtendimentosConcluidos ?? 0;
    const atendPendentes = dados.QtdAtendimentosPendentes ?? 0;

    const totalVendasSubtextoEl = document.getElementById('totalVendasSubtexto');
    if (totalVendasSubtextoEl) {
        totalVendasSubtextoEl.textContent = totalAtendimentos > 0
            ? `${totalAtendimentos} atendimentos (${atendConcluidos} concluídos, ${atendPendentes} em aberto).`
            : 'Nenhum atendimento registrado.';
    }

    const valorAReceberSubtextoEl = document.getElementById('valorAReceberSubtexto');
    if (valorAReceberSubtextoEl) {
        valorAReceberSubtextoEl.textContent = dados.ValorAReceber > 0
            ? `${atendPendentes} atendimento(s) em andamento somando ${formatarMoeda(dados.ValorAReceber)}.`
            : 'Nenhum valor pendente no momento.';
    }

    const valorRecebidoSubtextoEl = document.getElementById('valorRecebidoSubtexto');
    if (valorRecebidoSubtextoEl) {
        valorRecebidoSubtextoEl.textContent = atendConcluidos > 0
            ? `Referente a ${atendConcluidos} atendimento(s) concluído(s).`
            : 'Ainda não há atendimentos concluídos.';
    }

    // Atualizar cards de repasse
    const repasseCuidadorEl = document.getElementById('repasseCuidador');
    if (repasseCuidadorEl) {
        repasseCuidadorEl.textContent = formatarMoeda(dados.RepasseCuidador ?? 0);
    }

    const receitaPlataformaEl = document.getElementById('receitaPlataforma');
    if (receitaPlataformaEl) {
        receitaPlataformaEl.textContent = formatarMoeda(dados.ReceitaPlataforma ?? 0);
    }

    const repasseCuidadorSubtextoEl = document.getElementById('repasseCuidadorSubtexto');
    if (repasseCuidadorSubtextoEl) {
        repasseCuidadorSubtextoEl.textContent = `Total estimado a repassar aos cuidadores (90% das vendas).`;
    }

    const receitaPlataformaSubtextoEl = document.getElementById('receitaPlataformaSubtexto');
    if (receitaPlataformaSubtextoEl) {
        receitaPlataformaSubtextoEl.textContent = `Participação da plataforma (10% das vendas).`;
    }
    
    // Atualizar cores baseadas no lucro
    const lucroElement = document.getElementById('lucroLiquido');
    const margemElement = document.getElementById('margemLucro');
    
    if (dados.LucroLiquido >= 0) {
        lucroElement.style.color = '#27ae60';
        margemElement.style.color = '#27ae60';
    } else {
        lucroElement.style.color = '#e74c3c';
        margemElement.style.color = '#e74c3c';
    }
    
    // Atualizar cores dos cards de vendas baseadas nos valores
    const valorAReceberElement = document.getElementById('valorAReceber');
    const valorRecebidoElement = document.getElementById('valorRecebido');
    
    // Se há valor a receber, destacar em laranja
    if (dados.ValorAReceber > 0) {
        valorAReceberElement.style.color = '#e67e22';
    } else {
        valorAReceberElement.style.color = '#2c3e50';
    }
    
    // Se há valor recebido, destacar em verde
    if (dados.ValorRecebido > 0) {
        valorRecebidoElement.style.color = '#27ae60';
    } else {
        valorRecebidoElement.style.color = '#2c3e50';
    }
}

// Criar gráfico de receitas
function criarGraficoReceitas(dados) {
    const ctx = document.getElementById('receitasChart').getContext('2d');
    
    if (receitasChart) {
        receitasChart.destroy();
    }
    
    // Se não há dados, criar gráfico vazio
    if (!dados || dados.length === 0) {
        receitasChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Nenhum dado disponível'],
                datasets: [{
                    label: 'Receitas',
                    data: [0],
                    borderColor: '#3498db',
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return 'R$ ' + value.toLocaleString('pt-BR');
                            }
                        }
                    }
                }
            }
        });
        return;
    }
    
    const labels = dados.map(item => {
        const [ano, mes] = item.Mes.split('-');
        return new Date(ano, mes - 1).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
    });
    
    const valores = dados.map(item => parseFloat(item.TotalReceitas) || 0);
    
    receitasChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Receitas',
                data: valores,
                borderColor: '#3498db',
                backgroundColor: 'rgba(52, 152, 219, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return 'R$ ' + value.toLocaleString('pt-BR');
                        }
                    }
                }
            }
        }
    });
}

// Criar gráfico de despesas
function criarGraficoDespesas(dados) {
    const ctx = document.getElementById('despesasChart').getContext('2d');
    
    if (despesasChart) {
        despesasChart.destroy();
    }
    
    // Se não há dados, criar gráfico vazio
    if (!dados || dados.length === 0) {
        despesasChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Nenhum dado disponível'],
                datasets: [{
                    data: [1],
                    backgroundColor: ['#e9ecef'],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
        return;
    }
    
    const labels = dados.map(item => item.Categoria);
    const valores = dados.map(item => parseFloat(item.TotalDespesas) || 0);
    
    const cores = [
        '#e74c3c', '#f39c12', '#f1c40f', '#2ecc71', 
        '#1abc9c', '#3498db', '#9b59b6', '#e67e22'
    ];
    
    despesasChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: valores,
                backgroundColor: cores.slice(0, labels.length),
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Atualizar tabela de cuidadores rentáveis
function atualizarTabelaCuidadoresRentaveis(dados) {
    const tbody = document.getElementById('cuidadoresRentaveisTable');
    tbody.innerHTML = '';
    
    if (!dados || dados.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center" style="color: #6c757d; font-style: italic;">Nenhum cuidador com dados financeiros encontrado</td></tr>';
        return;
    }
    
    dados.forEach(cuidador => {
        const nome = cuidador.Nome || cuidador.NomeCuidador || 'N/A';
        const qtdAtendimentos = normalizarNumero(
            cuidador.QtdAtendimentos ??
            cuidador.TotalAtendimentos ??
            cuidador.Atendimentos ??
            cuidador.Total
        );

        const totalReceitas = normalizarNumero(
            cuidador.TotalReceitas ??
            cuidador.TotalReceita ??
            cuidador.ReceitaTotal ??
            cuidador.ReceitasTotais ??
            cuidador.ValorTotal
        );

        const totalComissoes = normalizarNumero(
            cuidador.TotalComissoes ??
            cuidador.TotalComissao ??
            cuidador.ComissoesTotais ??
            cuidador.ValorComissoes ??
            cuidador.ComissaoTotal ??
            cuidador.Comissao
        );

        let mediaAtendimento = normalizarNumero(
            cuidador.MediaAtendimento ??
            cuidador.MediaPorAtendimento ??
            cuidador.MediaReceita ??
            cuidador.Media
        );

        if (!mediaAtendimento && qtdAtendimentos > 0) {
            mediaAtendimento = totalReceitas / qtdAtendimentos;
        }

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${nome}</td>
            <td>${qtdAtendimentos}</td>
            <td>${formatarMoeda(totalReceitas)}</td>
            <td>${formatarMoeda(mediaAtendimento)}</td>
            <td>${formatarMoeda(totalComissoes)}</td>
        `;
        tbody.appendChild(row);
    });
}

// Atualizar tabela de inadimplência
function atualizarTabelaInadimplencia(dados) {
    const tbody = document.getElementById('inadimplenciaTable');
    tbody.innerHTML = '';
    
    if (!dados || dados.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center" style="color: #28a745; font-style: italic;">✅ Nenhuma inadimplência encontrada - Todos os pagamentos em dia!</td></tr>';
        return;
    }
    
    dados.forEach(item => {
        const row = document.createElement('tr');
        const statusClass = item.Status === 'Em Atraso' ? 'status-atraso' : 'status-normal';
        
        row.innerHTML = `
            <td>${item.NomeResponsavel || 'N/A'}</td>
            <td>${formatarMoeda(item.ValorDevido || 0)}</td>
            <td><span class="badge ${statusClass}">${item.DiasAtraso || 0} dias</span></td>
            <td><span class="status-badge ${statusClass}">${item.Status || 'N/A'}</span></td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="enviarCobranca(${item.IdInadimplencia})">
                    <i class="fas fa-envelope"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Atualizar metas financeiras
function atualizarMetasFinanceiras(dados) {
    const container = document.getElementById('metasGrid');
    container.innerHTML = '';
    
    if (!dados || dados.length === 0) {
        container.innerHTML = '<p class="text-center">Nenhuma meta encontrada</p>';
        return;
    }
    
    dados.forEach(meta => {
        const metaCard = document.createElement('div');
        metaCard.className = 'meta-card';
        
        const percentual = parseFloat(meta.PercentualAlcancado) || 0;
        const corBarra = percentual >= 100 ? '#27ae60' : percentual >= 75 ? '#f39c12' : '#e74c3c';
        
        metaCard.innerHTML = `
            <div class="meta-header">
                <span class="meta-tipo">${meta.TipoMeta}</span>
                <span class="meta-percentual">${percentual.toFixed(1)}%</span>
            </div>
            <div class="meta-descricao">${meta.Descricao || 'Sem descrição'}</div>
            <div class="meta-progress">
                <div class="meta-progress-bar" style="width: ${Math.min(percentual, 100)}%; background: ${corBarra}"></div>
            </div>
            <div class="meta-valores">
                <span>R$ ${formatarMoeda(meta.ValorAtual || 0)}</span>
                <span>R$ ${formatarMoeda(meta.ValorMeta || 0)}</span>
            </div>
        `;
        
        container.appendChild(metaCard);
    });
}

// ========== FORMULÁRIOS ==========

// Abrir modal nova receita
function abrirModalNovaReceita() {
    document.getElementById('modalNovaReceita').style.display = 'block';
    document.getElementById('formNovaReceita').reset();
}

// Fechar modal nova receita
function fecharModalNovaReceita() {
    document.getElementById('modalNovaReceita').style.display = 'none';
}

// Criar nova receita
async function criarNovaReceita() {
    const form = document.getElementById('formNovaReceita');
    const formData = new FormData(form);
    
    const receita = {
        IdResponsavel: formData.get('IdResponsavel'),
        IdAtendimento: formData.get('IdAtendimento') || null,
        Valor: parseFloat(formData.get('Valor')),
        FormaPagamento: formData.get('FormaPagamento'),
        Observacoes: formData.get('Observacoes')
    };
    
    try {
        const response = await fetch('/api/financeiro/receita', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(receita)
        });
        
        let result = null;
        try {
            result = await response.clone().json();
        } catch (jsonError) {
            // ignora caso a resposta não seja JSON
        }
        const textoResposta = result ? null : await response.text().catch(() => null);
        
        if (!response.ok) {
            const mensagem = result?.message || textoResposta || `Não foi possível registrar a receita (erro ${response.status}).`;
            throw new Error(mensagem);
        }
        
        if (result?.success) {
            exibirSucesso('Receita criada com sucesso!');
            fecharModalNovaReceita();
            await carregarEstatisticasFinanceiras();
        } else {
            throw new Error(result?.message || textoResposta || 'Não foi possível registrar a receita.');
        }
    } catch (error) {
        console.error('Erro ao criar receita:', error);
        exibirErro(error.message || 'Erro ao criar receita');
    }
}

// Abrir modal nova despesa
function abrirModalNovaDespesa() {
    document.getElementById('modalNovaDespesa').style.display = 'block';
    document.getElementById('formNovaDespesa').reset();
}

// Fechar modal nova despesa
function fecharModalNovaDespesa() {
    document.getElementById('modalNovaDespesa').style.display = 'none';
}

// Criar nova despesa
async function criarNovaDespesa() {
    const form = document.getElementById('formNovaDespesa');
    const formData = new FormData(form);
    
    const despesa = {
        TipoDespesa: formData.get('TipoDespesa'),
        Categoria: formData.get('Categoria'),
        Descricao: formData.get('Descricao'),
        Valor: parseFloat(formData.get('Valor')),
        IdCuidador: formData.get('IdCuidador') || null,
        Comprovante: formData.get('Comprovante'),
        Observacoes: formData.get('Observacoes')
    };
    
    try {
        const response = await fetch('/api/financeiro/despesa', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(despesa)
        });
        
        let result = null;
        try {
            result = await response.clone().json();
        } catch (jsonError) {
            // resposta não era JSON
        }
        const textoResposta = result ? null : await response.text().catch(() => null);
        
        if (!response.ok) {
            const mensagem = result?.message || textoResposta || `Não foi possível registrar a despesa (erro ${response.status}).`;
            throw new Error(mensagem);
        }
        
        if (result?.success) {
            exibirSucesso('Despesa criada com sucesso!');
            fecharModalNovaDespesa();
            await carregarEstatisticasFinanceiras();
            await carregarDespesasPorCategoria();
        } else {
            throw new Error(result?.message || textoResposta || 'Não foi possível registrar a despesa.');
        }
    } catch (error) {
        console.error('Erro ao criar despesa:', error);
        exibirErro(error.message || 'Erro ao criar despesa');
    }
}

// ========== FUNÇÕES AUXILIARES ==========

// Atualizar select de responsáveis
function atualizarSelectResponsaveis(responsaveis) {
    const select = document.getElementById('receitaResponsavel');
    select.innerHTML = '<option value="">Selecione um responsável...</option>';
    
    if (!responsaveis || !Array.isArray(responsaveis)) {
        console.warn('Dados inválidos para responsáveis:', responsaveis);
        return;
    }
    
    responsaveis.forEach(responsavel => {
        const option = document.createElement('option');
        option.value = responsavel.IdResponsavel;
        option.textContent = responsavel.Nome;
        select.appendChild(option);
    });
}

// Atualizar select de cuidadores
function atualizarSelectCuidadores(cuidadores) {
    const select = document.getElementById('despesaCuidador');
    select.innerHTML = '<option value="">Selecione um cuidador...</option>';
    
    if (!cuidadores || !Array.isArray(cuidadores)) {
        console.warn('Dados inválidos para cuidadores:', cuidadores);
        return;
    }
    
    cuidadores.forEach(cuidador => {
        const option = document.createElement('option');
        option.value = cuidador.IdCuidador;
        option.textContent = cuidador.Nome;
        select.appendChild(option);
    });
}

// Atualizar select de atendimentos
function atualizarSelectAtendimentos(atendimentos) {
    const select = document.getElementById('receitaAtendimento');
    select.innerHTML = '<option value="">Selecione um atendimento...</option>';
    
    if (!atendimentos || !Array.isArray(atendimentos)) {
        console.warn('Dados inválidos para atendimentos:', atendimentos);
        return;
    }
    
    atendimentos.forEach(atendimento => {
        const option = document.createElement('option');
        option.value = atendimento.IdAtendimento;
        
        // Usar campos corretos da tabela atendimento
        const descricao = atendimento.ObservacaoExtra || `Atendimento #${atendimento.IdAtendimento}`;
        const data = formatarDataCurta(atendimento.DataInicio);
        const status = atendimento.Status || 'N/A';
        const valor = formatarMoeda(atendimento.Valor || 0);
        
        option.textContent = `${descricao} - ${data} (${status}) - ${valor}`;
        select.appendChild(option);
    });
}

// Enviar cobrança
async function enviarCobranca(idInadimplencia) {
    if (confirm('Deseja enviar uma cobrança para este responsável?')) {
        // Aqui você implementaria a lógica de envio de cobrança
        exibirSucesso('Cobrança enviada com sucesso!');
    }
}

// ========== FUNÇÕES DE UTILIDADE ==========

// Utilidades de formatação (já declaradas no topo do arquivo)

// Mostrar carregamento
function mostrarCarregamento() {
    const container = document.querySelector('.financeiro-container');
    if (!container.querySelector('.loading-overlay')) {
        const overlay = document.createElement('div');
        overlay.className = 'loading-overlay';
        overlay.innerHTML = '<div class="loading"><i class="fas fa-spinner"></i> Carregando...</div>';
        container.appendChild(overlay);
    }
}

// Remover carregamento
function removerCarregamento() {
    const overlay = document.querySelector('.loading-overlay');
    if (overlay) {
        overlay.remove();
    }
}

// Exibir erro
function exibirErro(mensagem) {
    showToast(mensagem, 'error');
}

// Exibir sucesso
function exibirSucesso(mensagem) {
    showToast(mensagem, 'success');
}

// Verificar se há dados financeiros
async function verificarSeTemDados() {
    try {
        const response = await fetch(`/api/financeiro/estatisticas?dataInicio=${filtrosAtivos.dataInicio}&dataFim=${filtrosAtivos.dataFim}`);
        const result = await response.json();
        
        if (result.success && result.data) {
            const dados = result.data;
            // Verificar se há pelo menos algum dado
            return (parseFloat(dados.TotalReceitas) > 0 || 
                   parseFloat(dados.TotalDespesas) > 0 || 
                   parseFloat(dados.TotalComissoes) > 0 ||
                   parseFloat(dados.TotalInadimplencia) > 0);
        }
        return false;
    } catch (error) {
        console.error('Erro ao verificar dados:', error);
        return false;
    }
}

// Exibir mensagem quando não há dados
function exibirMensagemSemDados() {
    const container = document.querySelector('.financeiro-container');
    
    // Criar mensagem amigável
    const mensagemDiv = document.createElement('div');
    mensagemDiv.className = 'sem-dados-container';
    mensagemDiv.innerHTML = `
        <div class="sem-dados-card">
            <div class="sem-dados-icon">
                <i class="fas fa-chart-line"></i>
            </div>
            <h3>Bem-vindo ao Sistema Financeiro!</h3>
            <p>Você ainda não possui dados financeiros cadastrados.</p>
            <p>Comece cadastrando suas primeiras receitas e despesas para visualizar as estatísticas.</p>
            <div class="sem-dados-actions">
                <button class="btn btn-primary" onclick="abrirModalNovaReceita()">
                    <i class="fas fa-plus"></i> Cadastrar Primeira Receita
                </button>
                <button class="btn btn-secondary" onclick="abrirModalNovaDespesa()">
                    <i class="fas fa-minus"></i> Cadastrar Primeira Despesa
                </button>
            </div>
        </div>
    `;
    
    // Inserir antes dos cards de estatísticas
    const statsCards = document.querySelector('.stats-cards');
    if (statsCards) {
        container.insertBefore(mensagemDiv, statsCards);
    } else {
        container.appendChild(mensagemDiv);
    }
}
