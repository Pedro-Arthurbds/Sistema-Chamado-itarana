document.addEventListener("DOMContentLoaded", function () {
    const filtros = document.querySelectorAll(".status-filter");

    filtros.forEach(filtro => {
        const savedValue = localStorage.getItem(filtro.id);
        if (savedValue !== null) {
            filtro.checked = savedValue === "true"; 
        }
    });

    atualizarTabela(); 
    
    filtros.forEach(filtro => {
        filtro.addEventListener("change", function () {
            localStorage.setItem(filtro.id, filtro.checked);
            atualizarTabela();
        });
    });

    function atualizarTabela() {
        let statusSelecionados = Array.from(filtros)
            .filter(filtro => filtro.checked)
            .map(filtro => filtro.value);

        document.querySelectorAll(".chamado-row").forEach(row => {
            if (statusSelecionados.includes(row.dataset.status)) {
                row.style.display = "";
            } else {
                row.style.display = "none";
            }
        });
    }
});

document.getElementById("btnFiltrar").addEventListener("click", function () {
    const dataInicio = document.getElementById("dataInicio").value || null;
    const dataFim = document.getElementById("dataFim").value || null;

    const filtros = {
        data_inicio: dataInicio,
        data_fim: dataFim,
        setor: document.getElementById("filtroSetor").value || null,
        tipo_data: document.getElementById("tipoData").value || 'abertura'
    };

    console.log("Enviando filtros:", filtros); // Verifique se os dados estão corretos

    fetch('/chamados/filtrar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filtros)
    })
    .then(response => response.json())
    .then(data => {
        console.log("Resposta do servidor:", data);
        atualizarTabelaChamados(data);
    })
    .catch(error => console.error('Erro ao buscar chamados:', error));
});
