document.addEventListener('DOMContentLoaded', function() {
    const usuario = JSON.parse(localStorage.getItem('usuarioLogado'));
    if (!usuario || !usuario.chave) {
        alert("Você precisa estar logado.");
        window.location.href = '../index.html';
        return;
    }

    const tabelaCompras = document.getElementById('tabela-compras');
    const tabelaContainer = document.getElementById('tabela-container');
    const semCompras = document.getElementById('sem-compras');

    carregarCompras();

    function carregarCompras() {
        const compras = JSON.parse(localStorage.getItem('compras')) || [];
        const comprasUsuario = compras.filter(c => c.usuarioChave === usuario.chave);
        
        tabelaCompras.innerHTML = '';
        
        if (comprasUsuario.length === 0) {
            tabelaContainer.classList.add('d-none');
            semCompras.classList.remove('d-none');
        } else {
            tabelaContainer.classList.remove('d-none');
            semCompras.classList.add('d-none');
            
            // Ordena por data (mais recente primeiro)
            comprasUsuario.sort((a, b) => new Date(b.data) - new Date(a.data));
            
            comprasUsuario.forEach(compra => {
                const data = new Date(compra.data);
                const dataFormatada = data.toLocaleDateString('pt-BR') + ' ' + 
                                   data.toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'});
                
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${dataFormatada}</td>
                    <td>
                        <strong>${compra.descricao}</strong>
                        <div class="text-muted small">ID: ${compra.idProduto}</div>
                    </td>
                    <td>R$${compra.valor.toFixed(2)}</td>
                    <td><span class="badge bg-success">Concluído</span></td>
                `;
                tabelaCompras.appendChild(row);
            });
        }
    }
});