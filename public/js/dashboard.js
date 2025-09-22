// public/js/dashboard.js

// Variáveis globais para os gráficos
let charts = {};
let dashboardData = {};

// Função para carregar todas as métricas do dashboard
async function carregarMetricasCompletas() {
    // Mostrar indicador de carregamento
    mostrarCarregamento();
    
    try {
        const data = await carregarDadosComRetry();
        
        if (data.success) {
            dashboardData = data.data;
            atualizarEstatisticas();
            criarGraficos();
            atualizarTabelas();
            atualizarIndicadoresCrescimento();
            // Remover indicador de carregamento
            removerCarregamento();
        } else {
            console.error('Erro ao carregar métricas:', data.message);
            exibirErro('Erro ao carregar métricas do dashboard');
            removerCarregamento();
        }
    } catch (error) {
        console.error('Erro na requisição após tentativas:', error);
        exibirErro('Erro de conexão. Verifique se o servidor está rodando.');
        removerCarregamento();
    }
}

// Função para atualizar as estatísticas nos cards
function atualizarEstatisticas() {
    try {
        const stats = dashboardData.estatisticasGerais || {};
        const financial = dashboardData.estatisticasFinanceiras || {};
        
        // Estatísticas gerais
        document.getElementById('totalCuidadores').textContent = stats.TotalCuidadores || 0;
        document.getElementById('totalResponsaveis').textContent = stats.TotalResponsaveis || 0;
        document.getElementById('totalIdosos').textContent = stats.TotalIdosos || 0;
        document.getElementById('totalAtendimentos').textContent = stats.AtendimentosConcluidos || 0;
        
        // Estatísticas financeiras
        document.getElementById('receitaTotal').textContent = formatarMoeda(financial.ReceitaTotal || 0);
        document.getElementById('valorMedioAtendimento').textContent = formatarMoeda(financial.ValorMedioAtendimento || 0);
        document.getElementById('pagamentosRealizados').textContent = financial.PagamentosRealizados || 0;
        document.getElementById('pagamentosPendentes').textContent = financial.PagamentosPendentes || 0;
    } catch (error) {
        console.error('Erro ao atualizar estatísticas:', error);
    }
}

// Função para criar todos os gráficos
function criarGraficos() {
    criarGraficoAtendimentosMes();
    criarGraficoStatus();
    criarGraficoAvaliacoes();
    criarGraficoAtendimentosDia();
}

// Gráfico de atendimentos por mês
function criarGraficoAtendimentosMes() {
    const ctx = document.getElementById('atendimentosMesChart').getContext('2d');
    const data = dashboardData.atendimentosPorMes || [];
    
    const labels = data.map(item => formatarMes(item.Mes));
    const atendimentos = data.map(item => item.TotalAtendimentos);
    const receitas = data.map(item => item.ReceitaMes || 0);
    
    if (charts.atendimentosMes) {
        charts.atendimentosMes.destroy();
    }
    
    charts.atendimentosMes = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Atendimentos',
                data: atendimentos,
                backgroundColor: 'rgba(52, 152, 219, 0.8)',
                borderColor: 'rgba(52, 152, 219, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

// Gráfico de distribuição por status
function criarGraficoStatus() {
    const ctx = document.getElementById('statusChart').getContext('2d');
    const data = dashboardData.atendimentosPorStatus || [];
    
    const labels = data.map(item => item.Status);
    const valores = data.map(item => item.Total);
    const cores = ['#3498db', '#27ae60', '#f39c12', '#e74c3c', '#9b59b6'];
    
    if (charts.status) {
        charts.status.destroy();
    }
    
    charts.status = new Chart(ctx, {
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

// Gráfico de distribuição de avaliações
function criarGraficoAvaliacoes() {
    const ctx = document.getElementById('avaliacoesChart').getContext('2d');
    const data = dashboardData.distribuicaoAvaliacoes || [];
    
    const labels = data.map(item => `${item.Nota} estrela${item.Nota > 1 ? 's' : ''}`);
    const valores = data.map(item => item.TotalAvaliacoes);
    const cores = ['#e74c3c', '#f39c12', '#f1c40f', '#2ecc71', '#27ae60'];
    
    if (charts.avaliacoes) {
        charts.avaliacoes.destroy();
    }
    
    charts.avaliacoes = new Chart(ctx, {
        type: 'pie',
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

// Gráfico de atendimentos por dia
function criarGraficoAtendimentosDia() {
    const ctx = document.getElementById('atendimentosDiaChart').getContext('2d');
    const data = dashboardData.atendimentosPorDia || [];
    
    const labels = data.map(item => formatarData(item.Data));
    const valores = data.map(item => item.TotalAtendimentos);
    
    if (charts.atendimentosDia) {
        charts.atendimentosDia.destroy();
    }
    
    charts.atendimentosDia = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Atendimentos por Dia',
                data: valores,
                borderColor: 'rgba(52, 152, 219, 1)',
                backgroundColor: 'rgba(52, 152, 219, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                },
                x: {
                    ticks: {
                        maxTicksLimit: 10
                    }
                }
            }
        }
    });
}

// Função para atualizar as tabelas
function atualizarTabelas() {
    atualizarTabelaCuidadoresAtivos();
    atualizarTabelaAutonomia();
}

// Tabela de cuidadores mais ativos
function atualizarTabelaCuidadoresAtivos() {
    const tbody = document.getElementById('cuidadoresAtivosTable');
    const data = dashboardData.cuidadoresMaisAtivos || [];
    
    if (data.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; color: #7f8c8d;">
                    Nenhum dado disponível
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = data.map(cuidador => {
        const mediaAvaliacao = parseFloat(cuidador.MediaAvaliacao) || 0;
        return `
            <tr>
                <td>${cuidador.Nome || 'N/A'}</td>
                <td>${cuidador.TotalAtendimentos || 0}</td>
                <td>
                    <span class="rating">
                        ${gerarEstrelas(mediaAvaliacao)}
                        <span style="margin-left: 0.5rem; color: #7f8c8d;">
                            (${mediaAvaliacao.toFixed(1)})
                        </span>
                    </span>
                </td>
                <td>${formatarMoeda(cuidador.ReceitaGerada || 0)}</td>
            </tr>
        `;
    }).join('');
}

// Tabela de distribuição por autonomia
function atualizarTabelaAutonomia() {
    const tbody = document.getElementById('autonomiaTable');
    const data = dashboardData.distribuicaoAutonomia || [];
    
    if (data.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="2" style="text-align: center; color: #7f8c8d;">
                    Nenhum dado disponível
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = data.map(item => `
        <tr>
            <td>${item.NivelAutonomia || 'N/A'}</td>
            <td>${item.TotalIdosos || 0}</td>
        </tr>
    `).join('');
}

// Função para atualizar indicadores de crescimento
function atualizarIndicadoresCrescimento() {
    try {
        const data = dashboardData.dadosCrescimento || [];
        
        if (data.length >= 2) {
            const atendimentos = data[0];
            const receita = data[1];
            
            console.log('Dados de crescimento:', { atendimentos, receita });
            
            const crescimentoAtendimentos = calcularCrescimento(atendimentos.MesAtual, atendimentos.MesAnterior);
            const crescimentoReceita = calcularCrescimento(receita.MesAtual, receita.MesAnterior);
            
            console.log(`Crescimento calculado - Atendimentos: ${crescimentoAtendimentos}%, Receita: ${crescimentoReceita}%`);
            
            // Atualizar elementos se existirem
            const elementoAtendimentos = document.getElementById('crescimentoAtendimentos');
            const elementoReceita = document.getElementById('crescimentoReceita');
            
            if (elementoAtendimentos) {
                elementoAtendimentos.textContent = `${crescimentoAtendimentos}%`;
                elementoAtendimentos.className = getClasseCrescimento(crescimentoAtendimentos);
            }
            
            if (elementoReceita) {
                elementoReceita.textContent = `${crescimentoReceita}%`;
                elementoReceita.className = getClasseCrescimento(crescimentoReceita);
            }
        } else {
            console.warn('Dados de crescimento insuficientes:', data);
        }
    } catch (error) {
        console.error('Erro ao atualizar indicadores de crescimento:', error);
    }
}

// Função para calcular crescimento percentual
function calcularCrescimento(atual, anterior) {
    // Converter para números para evitar problemas com strings
    const atualNum = parseFloat(atual) || 0;
    const anteriorNum = parseFloat(anterior) || 0;
    
    // Se não há dados anteriores, tratar como novo crescimento
    if (anteriorNum === 0) {
        return atualNum > 0 ? 100 : 0;
    }
    
    // Calcular crescimento percentual
    const crescimento = ((atualNum - anteriorNum) / anteriorNum) * 100;
    
    // Limitar a 999% para evitar valores muito altos
    return Math.round(Math.min(Math.max(crescimento, -999), 999));
}

// Função para obter classe CSS baseada no crescimento
function getClasseCrescimento(crescimento) {
    if (crescimento > 0) return 'positive-growth';
    if (crescimento < 0) return 'negative-growth';
    return 'neutral-growth';
}

// Função para gerar estrelas
function gerarEstrelas(nota) {
    // Garantir que nota seja um número
    const notaNumerica = parseFloat(nota) || 0;
    let estrelas = '';
    const notaInteira = Math.floor(notaNumerica);
    const temMeia = notaNumerica % 1 >= 0.5;
    
    for (let i = 1; i <= 5; i++) {
        if (i <= notaInteira) {
            estrelas += '<i class="fas fa-star" style="color: #f39c12;"></i>';
        } else if (i === notaInteira + 1 && temMeia) {
            estrelas += '<i class="fas fa-star-half-alt" style="color: #f39c12;"></i>';
        } else {
            estrelas += '<i class="far fa-star" style="color: #ddd;"></i>';
        }
    }
    return estrelas;
}

// Função para formatar moeda
function formatarMoeda(valor) {
    const valorNumerico = parseFloat(valor) || 0;
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(valorNumerico);
}

// Função para formatar mês
function formatarMes(mes) {
    const [ano, mesNum] = mes.split('-');
    const data = new Date(ano, mesNum - 1);
    return data.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
}

// Função para formatar data
function formatarData(data) {
    return new Date(data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

// Função para mostrar indicador de carregamento
function mostrarCarregamento() {
    // Remover mensagens de erro existentes
    removerCarregamento();
    
    const container = document.querySelector('.main-content');
    const div = document.createElement('div');
    div.id = 'loading-indicator';
    div.className = 'loading-message';
    div.innerHTML = `
        <div class="loading-content">
            <i class="fas fa-spinner fa-spin"></i>
            <span>Carregando dados do dashboard...</span>
        </div>
    `;
    
    container.insertBefore(div, container.firstChild);
}

// Função para remover indicador de carregamento
function removerCarregamento() {
    const loadingIndicator = document.getElementById('loading-indicator');
    if (loadingIndicator) {
        loadingIndicator.remove();
    }
}

// Função para exibir erro
function exibirErro(mensagem) {
    const container = document.querySelector('.main-content');
    const div = document.createElement('div');
    div.className = 'error-message';
    div.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${mensagem}`;
    
    container.insertBefore(div, container.firstChild);
    
    setTimeout(() => {
        div.remove();
    }, 5000);
}

// Função para atualizar dados em tempo real (opcional)
function iniciarAtualizacaoAutomatica() {
    // Atualizar dados a cada 5 minutos
    setInterval(() => {
        carregarMetricasCompletas();
    }, 5 * 60 * 1000);
}

// Função para carregar dados com retry automático
async function carregarDadosComRetry(tentativas = 3) {
    for (let i = 0; i < tentativas; i++) {
        try {
            const response = await fetch('/api/dashboard/metricas');
            const data = await response.json();
            
            if (data.success) {
                return data;
            }
        } catch (error) {
            console.log(`Tentativa ${i + 1} falhou, tentando novamente...`);
            if (i === tentativas - 1) {
                throw error;
            }
            // Aguardar antes da próxima tentativa
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        }
    }
}

// Função para redimensionar gráficos
function redimensionarGraficos() {
    Object.values(charts).forEach(chart => {
        if (chart) {
            chart.resize();
        }
    });
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Carregar dados iniciais
    carregarMetricasCompletas();
    
    // Iniciar atualização automática
    iniciarAtualizacaoAutomatica();
    
    // Redimensionar gráficos quando a janela for redimensionada
    window.addEventListener('resize', redimensionarGraficos);
});

// Função para exportar dados (opcional)
function exportarDados() {
    const dataStr = JSON.stringify(dashboardData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `dashboard-cogitare-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
}
