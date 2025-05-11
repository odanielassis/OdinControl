document.addEventListener('DOMContentLoaded', async function() {
    const usuario = JSON.parse(localStorage.getItem('usuarioLogado'));
    if (!usuario || !usuario.chave) {
        alert("Você precisa estar logado.");
        window.location.href = '../index.html';
        return;
    }

    const listaProdutos = document.getElementById('lista-produtos');
    const formAlerta = document.getElementById('form-alerta');
    const tabelaAlertas = document.getElementById('tabela-alertas');

    // Carrega produtos e alertas
    await carregarProdutos();
    carregarAlertasAtivos();

    // Formulário de novo alerta
    formAlerta.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const idProduto = parseInt(document.getElementById('produto-id').value);
        const valorDesejado = parseFloat(document.getElementById('valor-desejado').value);
        const acao = document.getElementById('acao').value;

        let alertas = JSON.parse(localStorage.getItem('alertas')) || [];

        // Verifica se já existe alerta ativo
        if (alertas.some(a => a.idProduto === idProduto && a.status === 'ativo' && a.usuarioChave === usuario.chave)) {
            alert("Já existe um alerta ativo para este produto!");
            return;
        }

        const novoAlerta = {
            id: Date.now(), // ID único
            idProduto,
            valorDesejado,
            acao,
            status: 'ativo',
            usuarioChave: usuario.chave,
            dataCriacao: new Date().toISOString()
        };

        alertas.push(novoAlerta);
        localStorage.setItem('alertas', JSON.stringify(alertas));

        alert("Alerta cadastrado com sucesso!");
        formAlerta.reset();
        carregarAlertasAtivos();
    });

    // Função para carregar produtos
    async function carregarProdutos() {
        try {
            const response = await fetch(`https://api-odinline.odiloncorrea.com/produto/${usuario.chave}/usuario`);
            const produtos = await response.json();
            
            listaProdutos.innerHTML = '';
            
            if (produtos.length === 0) {
                listaProdutos.innerHTML = '<tr><td colspan="4" class="text-center text-muted py-4">Nenhum produto cadastrado</td></tr>';
            } else {
                produtos.forEach(produto => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${produto.descricao}</td>
                        <td>${produto.id}</td>
                        <td>R$${parseFloat(produto.valor).toFixed(2)}</td>
                        <td><img src="${produto.urlImagem}" alt="Produto" width="50"></td>
                    `;
                    listaProdutos.appendChild(row);
                });
            }
        } catch (error) {
            console.error('Erro ao carregar produtos:', error);
            listaProdutos.innerHTML = '<tr><td colspan="4" class="text-center text-danger py-4">Erro ao carregar produtos</td></tr>';
        }
    }

    // Função para carregar alertas ativos
    function carregarAlertasAtivos() {
        const alertas = JSON.parse(localStorage.getItem('alertas')) || [];
        const alertasUsuario = alertas.filter(a => a.usuarioChave === usuario.chave && a.status === 'ativo');
        
        tabelaAlertas.innerHTML = '';
        
        if (alertasUsuario.length === 0) {
            tabelaAlertas.innerHTML = '<tr><td colspan="4" class="text-center text-muted py-4">Nenhum alerta ativo</td></tr>';
        } else {
            alertasUsuario.forEach(alerta => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${alerta.idProduto}</td>
                    <td>R$${alerta.valorDesejado.toFixed(2)}</td>
                    <td>${alerta.acao === 'notificar' ? 'Notificação' : 'Compra Automática'}</td>
                    <td>
                        <button onclick="removerAlerta(${alerta.id})" class="btn btn-sm btn-danger">
                            <i class="bi bi-trash"></i> Remover
                        </button>
                    </td>
                `;
                tabelaAlertas.appendChild(row);
            });
        }
    }

    // Monitoramento de preços (executa a cada 30 segundos)
    setInterval(verificarAlertas, 30000);
});

// Função global para remover alerta
function removerAlerta(id) {
    let alertas = JSON.parse(localStorage.getItem('alertas')) || [];
    alertas = alertas.filter(a => a.id !== id);
    localStorage.setItem('alertas', JSON.stringify(alertas));
    location.reload();
}

// Verificação de alertas
async function verificarAlertas() {
    const usuario = JSON.parse(localStorage.getItem('usuarioLogado'));
    if (!usuario) return;

    const alertas = JSON.parse(localStorage.getItem('alertas')) || [];
    const alertasAtivos = alertas.filter(a => a.status === 'ativo' && a.usuarioChave === usuario.chave);

    for (const alerta of alertasAtivos) {
        try {
            const response = await fetch(`https://api-odinline.odiloncorrea.com/produto/${alerta.idProduto}`);
            const produto = await response.json();
            const precoAtual = parseFloat(produto.valor);

            if (precoAtual <= alerta.valorDesejado) {
                if (alerta.acao === 'notificar') {
                    alert(`🔔 Alerta! ${produto.descricao} atingiu R$${precoAtual.toFixed(2)}`);
                } else {
                    // Registrar compra
                    const compras = JSON.parse(localStorage.getItem('compras')) || [];
                    compras.push({
                        id: Date.now(),
                        idProduto: produto.id,
                        descricao: produto.descricao,
                        valor: precoAtual,
                        data: new Date().toISOString(),
                        usuarioChave: usuario.chave
                    });
                    localStorage.setItem('compras', JSON.stringify(compras));
                    
                    alert(`✅ Compra registrada: ${produto.descricao} por R$${precoAtual.toFixed(2)}`);
                }

                // Atualiza status do alerta
                alerta.status = 'executado';
                localStorage.setItem('alertas', JSON.stringify(alertas));
            }
        } catch (error) {
            console.error(`Erro ao verificar produto ${alerta.idProduto}:`, error);
        }
    }
}