package br.com.semaperto.dto;

import br.com.semaperto.model.TipoMovimentacao;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CategoriaRequest(
        @NotBlank(message = "Informe o nome da categoria.")
        @Size(max = 80, message = "O nome pode ter no máximo 80 caracteres.")
        String nome,

        @NotNull(message = "Informe se é receita ou despesa.")
        TipoMovimentacao tipo,

        @NotBlank(message = "Escolha uma cor.")
        String cor,

        @NotBlank(message = "Escolha um ícone.")
        String icone
) {
}
