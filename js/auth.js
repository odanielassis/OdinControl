document.getElementById('form-login').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const login = document.getElementById('login').value;
    const senha = document.getElementById('senha').value;
    const erroDiv = document.getElementById('erro');
    
    try {
        const response = await fetch(`https://api-odinline.odiloncorrea.com/usuario/${login}/${senha}/autenticar`);
        
        if (!response.ok) {
            throw new Error('Credenciais inválidas');
        }
        
        const usuario = await response.json();
        
        if (!usuario?.id) {
            throw new Error('Usuário não encontrado');
        }
        
        // Salva usuário no localStorage
        localStorage.setItem('usuarioLogado', JSON.stringify(usuario));
        
        // Redireciona para o menu
        window.location.href = 'menu.html';
        
    } catch (error) {
        erroDiv.textContent = 'Usuário ou senha inválidos. Por favor, tente novamente.';
        erroDiv.classList.remove('d-none');
        console.error('Erro na autenticação:', error);
    }
});

// Verifica se já está logado
document.addEventListener('DOMContentLoaded', function() {
    const usuario = JSON.parse(localStorage.getItem('usuarioLogado'));
    if (usuario?.id) {
        window.location.href = 'menu.html';
    }
});