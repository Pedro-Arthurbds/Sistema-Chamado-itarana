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


//NAO MEXE NESSA MERDA SENÂO O FILTRO PARA DE FUNCIONAR
$(document).ready(function() {
    $("#btnFiltrar").click(function() {
        let dataInicio = $("#dataInicio").val();
        let dataFim = $("#dataFim").val();
        let setor = $("#filtroSetor").val();
        let tipoData = $("#tipoData").val();

        $.ajax({
            url: "/painel/adm/filtrar",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify({
                data_inicio: dataInicio,
                data_fim: dataFim,
                setor: setor,
                tipo_data: tipoData
            }),
            success: function(response) {
                atualizarTabela(response);
            },
            error: function(error) {
                console.log("Erro ao filtrar chamados:", error);
            }
        });
    });

    function atualizarTabela(chamados) {
        let tbody = $("#tabelaChamados");
        tbody.empty();  // Limpa a tabela antes de inserir novos dados

        chamados.forEach(chamado => {
            let statusBadge = "";
            if (chamado.status == 1) {
                statusBadge = '<span class="badge bg-warning">Pendente</span>';
            } else if (chamado.status == 2) {
                statusBadge = '<span class="badge bg-primary">Em Andamento</span>';
            } else if (chamado.status == 3) {
                statusBadge = '<span class="badge bg-success">Concluído</span>';
            } else {
                statusBadge = '<span class="badge bg-secondary">Desconhecido</span>';
            }

            let dataConclusao = chamado.data_conclusao ? chamado.data_conclusao : 'Em aberto';

            let row = `
                <tr class="chamado-row" data-status="${chamado.status}" ondblclick="window.location.href='/chamado/${chamado.id}'">
                    <td>${chamado.id}</td>
                    <td>${chamado.nome}</td>
                    <td>${statusBadge}</td>
                    <td>${chamado.setor}</td>
                    <td>${chamado.descricao}</td>
                    <td>${chamado.data_criacao}</td>
                    <td>${dataConclusao}</td>
                </tr>
            `;
            tbody.append(row);
        });
    }
});


function sortTable(columnIndex) {
    const table = document.querySelector("table");
    const tbody = table.querySelector("tbody");
    const rows = Array.from(tbody.querySelectorAll("tr"));
    const isAscending = table.getAttribute("data-sort-order") === "asc";
    const multiplier = isAscending ? 1 : -1;
    const sortKey = table.getAttribute("data-sort-column");

    // Se clicarmos na mesma coluna, invertemos a direção
    if (sortKey === String(columnIndex)) {
        table.setAttribute("data-sort-order", isAscending ? "desc" : "asc");
    } else {
        // Se for uma coluna diferente, começamos com ascendente
        table.setAttribute("data-sort-column", columnIndex);
        table.setAttribute("data-sort-order", "asc");
    }

    rows.sort((a, b) => {
        const aCell = a.cells[columnIndex];
        const bCell = b.cells[columnIndex];
        
        // Usamos o atributo data-order se existir (deve conter timestamp)
        if (aCell.hasAttribute("data-order") && bCell.hasAttribute("data-order")) {
            const aValue = parseFloat(aCell.getAttribute("data-order"));
            const bValue = parseFloat(bCell.getAttribute("data-order"));
            return (aValue - bValue) * multiplier;
        }
        
        // Fallback para ordenação por texto
        const aText = aCell.textContent.trim();
        const bText = bCell.textContent.trim();
        
        // Tratamento especial para datas no formato dd/mm/yyyy HH:MM
        if (aText.includes("/") && bText.includes("/")) {
            try {
                const aParts = aText.split(" ");
                const aDateParts = aParts[0].split("/");
                const aTimeParts = aParts.length > 1 ? aParts[1].split(":") : ["0", "0"];
                
                const bParts = bText.split(" ");
                const bDateParts = bParts[0].split("/");
                const bTimeParts = bParts.length > 1 ? bParts[1].split(":") : ["0", "0"];
                
                const aDate = new Date(
                    `${aDateParts[2]}-${aDateParts[1]}-${aDateParts[0]}T${aTimeParts[0]}:${aTimeParts[1]}:00`
                );
                
                const bDate = new Date(
                    `${bDateParts[2]}-${bDateParts[1]}-${bDateParts[0]}T${bTimeParts[0]}:${bTimeParts[1]}:00`
                );
                
                if (!isNaN(aDate) && !isNaN(bDate)) {
                    return (aDate - bDate) * multiplier;
                }
            } catch (e) {
                console.error("Erro ao parsear datas:", e);
            }
        }
        
        // Fallback para comparação de texto simples
        return aText.localeCompare(bText) * multiplier;
    });

    // Limpa o tbody
    while (tbody.firstChild) {
        tbody.removeChild(tbody.firstChild);
    }

    // Reinsere as linhas ordenadas
    rows.forEach(row => tbody.appendChild(row));
}

// Adiciona os event listeners aos cabeçalhos da tabela
document.querySelectorAll("th.sortable").forEach((th, index) => {
    th.addEventListener("click", () => sortTable(index));
});