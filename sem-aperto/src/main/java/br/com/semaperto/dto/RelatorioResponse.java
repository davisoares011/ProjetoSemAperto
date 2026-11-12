package br.com.semaperto.dto;

import java.math.BigDecimal;
import java.util.List;

public record RelatorioResponse(
        String mes,
        BigDecimal receitas,
        BigDecimal despesas,
        BigDecimal saldo,
        List<TotalMensal> ultimosMeses,
        List<TotalPorCategoria> despesasPorCategoria
) {
}
