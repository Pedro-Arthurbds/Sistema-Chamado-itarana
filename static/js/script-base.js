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


