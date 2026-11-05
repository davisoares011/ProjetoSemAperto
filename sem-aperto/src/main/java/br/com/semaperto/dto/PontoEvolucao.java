package br.com.semaperto.dto;

import java.math.BigDecimal;

/** Um ponto do gráfico de evolução do mês (valores acumulados até aquele dia). */
public record PontoEvolucao(int dia, BigDecimal receitas, BigDecimal despesas, BigDecimal saldo) {
}
