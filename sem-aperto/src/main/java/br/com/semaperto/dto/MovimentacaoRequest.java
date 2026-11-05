package br.com.semaperto.dto;

import br.com.semaperto.model.Frequencia;
import br.com.semaperto.model.TipoMovimentacao;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;

public record MovimentacaoRequest(
        @NotBlank(message = "Informe a descrição.")
        @Size(max = 140, message = "A descrição pode ter no máximo 140 caracteres.")
        String descricao,

        @NotNull(message = "Informe o valor.")
        @DecimalMin(value = "0.01", message = "O valor deve ser maior que zero.")
        @Digits(integer = 12, fraction = 2, message = "Valor inválido.")
        BigDecimal valor,

        @NotNull(message = "Informe a data.")
        LocalDate data,

        @NotNull(message = "Informe se é receita ou despesa.")
        TipoMovimentacao tipo,

        @NotNull(message = "Escolha uma categoria.")
        Long categoriaId,

        @NotBlank(message = "Escolha a conta.")
        @Size(max = 80)
        String conta,

        @Size(max = 500, message = "A observação pode ter no máximo 500 caracteres.")
        String observacao,

        @NotNull(message = "Informe a frequência.")
        Frequencia frequencia
) {
}
