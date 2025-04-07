document.addEventListener("DOMContentLoaded", function () {
    const statusSelect = document.getElementById("status");
    const relatorioDiv = document.getElementById("relatorio_conclusao");
    const form = document.querySelector("form");

    function toggleRelatorio() {
        if (statusSelect.value == "3") {
            relatorioDiv.style.display = "block";
        } else {
            relatorioDiv.style.display = "none";
        }
    }

    // Verifica o status inicial
    toggleRelatorio();

    // Adiciona evento de mudança no select de status
    statusSelect.addEventListener("change", toggleRelatorio);

    // Adiciona evento de submit ao formulário
    form.addEventListener("submit", function(e) {
        if (statusSelect.value == "3") {
            const relatorio = document.getElementById("conclusao").value;
            if (!relatorio || relatorio.trim() === "") {
                e.preventDefault(); // Impede o envio do formulário
                alert("Por favor, preencha o relatório de conclusão quando o status for 'Concluído'.");
                relatorioDiv.style.display = "block";
                document.getElementById("conclusao").focus();
            }
        }
    });
});