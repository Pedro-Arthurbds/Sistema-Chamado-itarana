document.addEventListener("DOMContentLoaded", function() {
    const form = document.getElementById("chamadoForm");
    const tabelaChamados = document.getElementById("tabelaChamados");
  
    if (form) {
        form.addEventListener("submit", function(event) {
            event.preventDefault();
  
            const nome = document.getElementById("nome").value;
            const contato = document.getElementById("contato").value;
            const setor = document.getElementById("setor").value;
            const descricao = document.getElementById("descricao").value;
  
            const chamado = {
                setor,
                requerente: nome,
                data: new Date().toLocaleDateString(),
                titulo: descricao.substring(0, 20) + "...",
                status: "Pendente"
            };
  
            localStorage.setItem("chamado", JSON.stringify(chamado));
  
            alert("Chamado enviado com sucesso!");
            form.reset();
        });
    }
  
    if (tabelaChamados) {
        const chamadoSalvo = JSON.parse(localStorage.getItem("chamado"));
  
        if (chamadoSalvo) {
            const novaLinha = document.createElement("tr");
            novaLinha.innerHTML = `
                <td>${chamadoSalvo.setor}</td>
                <td>${chamadoSalvo.requerente}</td>
                <td>${chamadoSalvo.data}</td>
                <td>${chamadoSalvo.titulo}</td>
                <td>${chamadoSalvo.status}</td>
            `;
            tabelaChamados.appendChild(novaLinha);
        }
    }
  });
  
  
  document.addEventListener("DOMContentLoaded", function() {
      const arquivoInput = document.getElementById("arquivo");
      const fileError = document.getElementById("file-error");
      const clearFileBtn = document.getElementById("clear-file");
      const form = document.getElementById("conteudo");
  
      const extensoesPermitidas = ['.png', '.mp4', '.WMV', '.jpg', '.jpeg', '.gif', '.pdf', '.doc', '.docx'];
  
      arquivoInput.addEventListener("change", function() {
          if (arquivoInput.files.length > 0) {
              let arquivo = arquivoInput.files[0];
              let extensao = arquivo.name.substring(arquivo.name.lastIndexOf('.')).toLowerCase();
  
              if (!extensoesPermitidas.includes(extensao)) {
                  fileError.innerText = "Tipo de arquivo não permitido. Envie apenas imagens, PDFs ou documentos do Word.";
                  fileError.style.display = "block";
                  arquivoInput.value = "";  
              } else {
                  fileError.style.display = "none";
              }
          }
      });
  
      clearFileBtn.addEventListener("click", function() {
          arquivoInput.value = "";
          fileError.style.display = "none";
      });
  
      form.addEventListener("submit", function(event) {
          if (fileError.style.display === "block") {
              event.preventDefault();
              alert("Corrija os erros antes de enviar o chamado.");
          }
      });
  });
  
  
  

function removeError() {
        document.getElementById("recaptcha-error").classList.add("d-none"); // Esconde o erro quando o usuário valida o reCAPTCHA
    }

    document.getElementById("conteudo").addEventListener("submit", function(event) {
        // Verifica se o reCAPTCHA foi validado
        if (grecaptcha.getResponse() === "") {
            event.preventDefault(); // Impede o envio
            document.getElementById("recaptcha-error").classList.remove("d-none"); // Exibe a mensagem de erro
            return;
        }

        event.preventDefault(); // Impede o envio imediato do formulário

        let toastElement = new bootstrap.Toast(document.getElementById("success-toast"), {
            delay: 10000 // 10 segundos
        });

        toastElement.show(); // Exibe o toast

        setTimeout(() => {
            event.target.submit();
        }, 2000);
    });