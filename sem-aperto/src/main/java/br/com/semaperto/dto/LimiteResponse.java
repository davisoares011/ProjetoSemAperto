package br.com.semaperto.dto;

import java.math.BigDecimal;

public record LimiteResponse(Long id, BigDecimal valor, BigDecimal gasto, String mes,
                             Long categoriaId, String categoriaNome, String categoriaIcone, String categoriaCor) {
}
