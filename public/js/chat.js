// public/js/chat.js

// Variáveis globais
let currentTicketId = null;
let currentUserId = null;
let currentUserType = null;
let tickets = [];
let categorias = [];
let mensagens = [];

// Função para inicializar o suporte
async function inicializarSuporte() {
    try {
        // Por enquanto, vamos usar IDs fixos para demonstração
        // Em uma implementação real, você pegaria esses dados da sessão
        currentUserId = 1; // ID do usuário logado
        currentUserType = 'cuidador'; // Tipo do usuário (cuidador ou responsavel)
        
        await carregarEstatisticasSuporte();
        await carregarTickets();
        await carregarCategorias();
        
        // Configurar eventos
        configurarEventos();
        
    } catch (error) {
        console.error('Erro ao inicializar suporte:', error);
        exibirErro('Erro ao carregar o suporte');
    }
}

// Função para carregar estatísticas de suporte
async function carregarEstatisticasSuporte() {
    try {
        const response = await fetch('/api/suporte/estatisticas');
        const data = await response.json();
        
        if (data.success) {
            document.getElementById('totalTickets').textContent = data.data.TotalTickets || 0;
            document.getElementById('ticketsAbertos').textContent = data.data.TicketsAbertos || 0;
            document.getElementById('ticketsAltaPrioridade').textContent = data.data.TicketsAltaPrioridade || 0;
        }
    } catch (error) {
        console.error('Erro ao carregar estatísticas de suporte:', error);
    }
}

// Função para carregar tickets
async function carregarTickets() {
    try {
        const response = await fetch(`/api/suporte/tickets/${currentUserId}/${currentUserType}`);
        const data = await response.json();
        
        if (data.success) {
            tickets = data.data;
            exibirTickets(tickets);
        } else {
            console.error('Erro ao carregar tickets:', data.message);
        }
    } catch (error) {
        console.error('Erro na requisição de tickets:', error);
    }
}

// Função para exibir tickets na sidebar
function exibirTickets(ticketsList) {
    const container = document.getElementById('ticketsList');
    
    if (ticketsList.length === 0) {
        container.innerHTML = `
            <div class="loading">
                <i class="fas fa-headset"></i>
                <span>Nenhum ticket encontrado</span>
            </div>
        `;
        return;
    }
    
    container.innerHTML = ticketsList.map(ticket => {
        const ultimaMensagem = ticket.UltimaMensagem || 'Nenhuma mensagem ainda';
        const dataUltimaMensagem = ticket.DataUltimaMensagem 
            ? formatarDataHora(ticket.DataUltimaMensagem)
            : '';
        
        const temMensagensNaoLidas = ticket.MensagensNaoLidas > 0;
        const prioridadeClass = ticket.Prioridade === 'Alta' ? 'high-priority' : 
                               ticket.Prioridade === 'Urgente' ? 'urgent-priority' : '';
        
        return `
            <div class="conversation-item ${temMensagensNaoLidas ? 'unread' : ''} ${prioridadeClass}" 
                 onclick="abrirTicket(${ticket.IdChat})">
                <div class="conversation-header">
                    <div class="ticket-info">
                        <h4 class="conversation-name">${ticket.Assunto || 'Ticket de Suporte'}</h4>
                        <span class="ticket-category">${ticket.Categoria}</span>
                    </div>
                    <span class="conversation-time">${dataUltimaMensagem}</span>
                </div>
                <p class="conversation-preview">${ultimaMensagem}</p>
                <div class="ticket-status">
                    <span class="status-badge status-${ticket.StatusSuporte.toLowerCase().replace(' ', '-')}">${ticket.StatusSuporte}</span>
                    ${ticket.Prioridade !== 'Normal' ? `<span class="priority-badge priority-${ticket.Prioridade.toLowerCase()}">${ticket.Prioridade}</span>` : ''}
                </div>
                ${temMensagensNaoLidas ? 
                    `<div class="conversation-badge">${ticket.MensagensNaoLidas}</div>` 
                    : ''}
            </div>
        `;
    }).join('');
}

// Função para carregar categorias de suporte
async function carregarCategorias() {
    try {
        const response = await fetch('/api/suporte/categorias');
        const data = await response.json();
        
        if (data.success) {
            categorias = data.data;
        }
    } catch (error) {
        console.error('Erro ao carregar categorias:', error);
    }
}

// Função para abrir um ticket
async function abrirTicket(ticketId) {
    try {
        currentTicketId = ticketId;
        
        // Atualizar UI
        document.getElementById('chatEmpty').style.display = 'none';
        document.getElementById('chatActive').style.display = 'flex';
        
        // Remover classe active de todos os tickets
        document.querySelectorAll('.conversation-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // Adicionar classe active ao ticket selecionado
        event.currentTarget.classList.add('active');
        
        // Carregar informações do ticket
        await carregarInformacoesTicket(ticketId);
        
        // Carregar mensagens
        await carregarMensagensSuporte(ticketId);
        
        // Marcar mensagens como lidas
        await marcarMensagensComoLidas(ticketId);
        
    } catch (error) {
        console.error('Erro ao abrir ticket:', error);
        exibirErro('Erro ao abrir ticket');
    }
}

// Função para carregar informações do ticket
async function carregarInformacoesTicket(ticketId) {
    try {
        const response = await fetch(`/api/suporte/ticket/${ticketId}`);
        const data = await response.json();
        
        if (data.success && data.data) {
            const ticket = data.data;
            
            document.getElementById('chatUserName').textContent = ticket.Assunto || 'Ticket de Suporte';
            document.getElementById('chatUserAvatar').src = '/imagens/admin-avatar.png';
            document.getElementById('chatUserStatus').textContent = ticket.StatusSuporte;
            
            // Atualizar classe do status
            const statusElement = document.getElementById('chatUserStatus');
            statusElement.className = `status-${ticket.StatusSuporte.toLowerCase().replace(' ', '-')}`;
        }
    } catch (error) {
        console.error('Erro ao carregar informações do ticket:', error);
    }
}

// Função para carregar mensagens de suporte
async function carregarMensagensSuporte(ticketId) {
    try {
        const response = await fetch(`/api/suporte/${ticketId}/mensagens`);
        const data = await response.json();
        
        if (data.success) {
            mensagens = data.data;
            exibirMensagensSuporte(mensagens);
        }
    } catch (error) {
        console.error('Erro ao carregar mensagens de suporte:', error);
    }
}

// Função para exibir mensagens de suporte
function exibirMensagensSuporte(msgs) {
    const container = document.getElementById('chatMessages');
    
    if (msgs.length === 0) {
        container.innerHTML = `
            <div class="loading">
                <i class="fas fa-comment"></i>
                <span>Nenhuma mensagem ainda</span>
            </div>
        `;
        return;
    }
    
    container.innerHTML = msgs.map(msg => {
        const isAdmin = msg.IsAdmin;
        const nomeRemetente = msg.NomeRemetente || 'Usuário';
        const fotoRemetente = msg.FotoRemetente || '/imagens/default-avatar.png';
        const dataEnvio = formatarDataHora(msg.DataEnvio);
        
        return `
            <div class="message ${isAdmin ? 'admin' : 'user'}">
                <img src="${fotoRemetente}" alt="${nomeRemetente}" class="message-avatar">
                <div class="message-content">
                    <div class="message-header">
                        <span class="message-sender">${nomeRemetente}</span>
                        <span class="message-time">${dataEnvio}</span>
                    </div>
                    <p class="message-text">${msg.Conteudo}</p>
                </div>
            </div>
        `;
    }).join('');
    
    // Scroll para a última mensagem
    container.scrollTop = container.scrollHeight;
}

// Função para enviar mensagem de suporte
async function enviarMensagemSuporte() {
    const input = document.getElementById('messageInput');
    const conteudo = input.value.trim();
    
    if (!conteudo || !currentTicketId) {
        return;
    }
    
    try {
        const response = await fetch('/api/suporte/mensagem', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                IdChat: currentTicketId,
                IdRemetente: currentUserId,
                RemetenteTipo: currentUserType,
                Conteudo: conteudo,
                IsAdmin: false
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Limpar input
            input.value = '';
            
            // Recarregar mensagens
            await carregarMensagensSuporte(currentTicketId);
            
            // Recarregar tickets para atualizar última mensagem
            await carregarTickets();
        } else {
            exibirErro('Erro ao enviar mensagem');
        }
    } catch (error) {
        console.error('Erro ao enviar mensagem:', error);
        exibirErro('Erro ao enviar mensagem');
    }
}

// Função para marcar mensagens como lidas
async function marcarMensagensComoLidas(ticketId) {
    try {
        await fetch(`/api/suporte/${ticketId}/marcar-lidas`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                IdUsuario: currentUserId,
                TipoUsuario: currentUserType
            })
        });
        
        // Recarregar estatísticas
        await carregarEstatisticasSuporte();
    } catch (error) {
        console.error('Erro ao marcar mensagens como lidas:', error);
    }
}

// Função para abrir modal de novo ticket
async function abrirModalNovoTicket() {
    const modal = document.getElementById('modalNovoTicket');
    
    // Limpar campos
    document.getElementById('categoriaSelect').value = '';
    document.getElementById('prioridadeSelect').value = 'Normal';
    document.getElementById('assuntoInput').value = '';
    document.getElementById('descricaoInput').value = '';
    
    modal.style.display = 'block';
}

// Função para fechar modal de novo ticket
function fecharModalNovoTicket() {
    document.getElementById('modalNovoTicket').style.display = 'none';
}

// Função para criar novo ticket
async function criarNovoTicket() {
    const categoria = document.getElementById('categoriaSelect').value;
    const prioridade = document.getElementById('prioridadeSelect').value;
    const assunto = document.getElementById('assuntoInput').value.trim();
    const descricao = document.getElementById('descricaoInput').value.trim();
    
    if (!categoria || !assunto || !descricao) {
        exibirErro('Preencha todos os campos obrigatórios');
        return;
    }
    
    try {
        const response = await fetch('/api/suporte/ticket', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                IdUsuario: currentUserId,
                TipoUsuario: currentUserType,
                Categoria: categoria,
                Prioridade: prioridade,
                Assunto: assunto
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Enviar mensagem inicial com a descrição
            await fetch('/api/suporte/mensagem', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    IdChat: data.data.id,
                    IdRemetente: currentUserId,
                    RemetenteTipo: currentUserType,
                    Conteudo: descricao,
                    IsAdmin: false
                })
            });
            
            fecharModalNovoTicket();
            await carregarTickets();
            await abrirTicket(data.data.id);
        } else {
            exibirErro(data.message);
        }
    } catch (error) {
        console.error('Erro ao criar novo ticket:', error);
        exibirErro('Erro ao criar novo ticket');
    }
}

// Função para fechar ticket
async function fecharTicket() {
    if (!currentTicketId) return;
    
    if (!confirm('Tem certeza que deseja fechar este ticket?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/suporte/ticket/${currentTicketId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                StatusSuporte: 'Fechado'
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Voltar para tela vazia
            document.getElementById('chatEmpty').style.display = 'flex';
            document.getElementById('chatActive').style.display = 'none';
            currentTicketId = null;
            
            // Recarregar tickets
            await carregarTickets();
        } else {
            exibirErro('Erro ao fechar ticket');
        }
    } catch (error) {
        console.error('Erro ao fechar ticket:', error);
        exibirErro('Erro ao fechar ticket');
    }
}

// Função para formatar data e hora
function formatarDataHora(dataHora) {
    if (!dataHora) return '';
    
    const data = new Date(dataHora);
    const agora = new Date();
    const diffMs = agora - data;
    const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDias === 0) {
        return data.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
        });
    } else if (diffDias === 1) {
        return 'Ontem';
    } else if (diffDias < 7) {
        return data.toLocaleDateString('pt-BR', { weekday: 'short' });
    } else {
        return data.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit'
        });
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

// Função para configurar eventos
function configurarEventos() {
    // Enter para enviar mensagem
    document.getElementById('messageInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            enviarMensagemSuporte();
        }
    });
    
    // Auto-resize do textarea
    document.getElementById('messageInput').addEventListener('input', (e) => {
        e.target.style.height = 'auto';
        e.target.style.height = e.target.scrollHeight + 'px';
    });
    
    // Fechar modais ao clicar fora
    window.addEventListener('click', (e) => {
        const modalNovoTicket = document.getElementById('modalNovoTicket');
        const modalNotificacoes = document.getElementById('notificationModal');
        
        if (e.target === modalNovoTicket) {
            fecharModalNovoTicket();
        }
        if (e.target === modalNotificacoes) {
            fecharModalNotificacoes();
        }
    });
}

// Função para fechar modal de notificações
function fecharModalNotificacoes() {
    document.getElementById('notificationModal').style.display = 'none';
}

// Função para atualizar dados periodicamente
function iniciarAtualizacaoAutomatica() {
    // Atualizar tickets a cada 30 segundos
    setInterval(async () => {
        if (!currentTicketId) {
            await carregarTickets();
            await carregarEstatisticasSuporte();
        }
    }, 30000);
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    inicializarSuporte();
    iniciarAtualizacaoAutomatica();
});
