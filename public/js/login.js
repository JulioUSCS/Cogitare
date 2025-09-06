// Previne detecção inicial do Kaspersky
document.addEventListener('DOMContentLoaded', function() {
    const senhaInput = document.getElementById('senha');
    if (senhaInput) {
        // Simula um campo de texto inicialmente
        senhaInput.setAttribute('type', 'text');
        senhaInput.style.webkitTextSecurity = 'disc';
        senhaInput.style.mozTextSecurity = 'disc';
        senhaInput.style.textSecurity = 'disc';
        
        // Muda para password após um pequeno delay
        setTimeout(() => {
            senhaInput.setAttribute('type', 'password');
        }, 100);
    }
});

function verificaUsuario(event) {
    event.preventDefault(); // impede envio padrão do formulário

    const usuarioInput = document.getElementById('usuario');
    const senhaInput = document.getElementById('senha');
    const usuario = usuarioInput.value.trim();
    const senha = senhaInput.value.trim();

    // Validações simples
    if (!usuario) {
        alert('Preencha o campo Usuário.');
        usuarioInput.focus();
        return;
    }
    if (!senha) {
        alert('Preencha o campo Senha.');
        senhaInput.focus();
        return;
    }
    if (senha.length < 4) {
        alert('A senha deve ter pelo menos 4 caracteres.');
        senhaInput.focus();
        return;
    }

    // Envia dados para o backend
    fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario, senha })
    })
    .then(res => {
        if (!res.ok) {
            // Se a resposta HTTP não for 2xx, tenta ler o JSON de erro
            return res.json().then(errorData => {
                throw new Error(errorData.mensagem || `Erro HTTP: ${res.status} ${res.statusText}`);
            });
        }
        return res.json();
    })
    .then(data => {
        if (data.sucesso) {
            // *** MUDANÇA AQUI: Verifica se há redirectUrl na resposta do backend ***
            if (data.redirectUrl) {
                window.location.href = data.redirectUrl;
            } else {
                // Fallback, caso o backend não envie (mas com as últimas mudanças, deve enviar)
                window.location.href = '/view/index.html';
            }
        } else {
            alert(data.mensagem || 'Usuário ou senha inválidos.');
        }
    })
    .catch(err => {
        console.error('Erro ao tentar logar:', err); // Log mais detalhado
        alert('Erro ao tentar logar: ' + err.message); // Exibe a mensagem de erro
    });
}