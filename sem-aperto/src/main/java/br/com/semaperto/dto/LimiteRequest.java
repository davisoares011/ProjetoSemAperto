package br.com.semaperto.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record LimiteRequest(
        @NotNull(message = "Escolha uma categoria.")
        Long categoriaId,

        @NotNull(message = "Informe o valor do limite.")
        @DecimalMin(value = "0.01", message = "O limite deve ser maior que zero.")
        BigDecimal valor,

        @NotBlank(message = "Informe o mês (AAAA-MM).")
        String mes
) {
}
