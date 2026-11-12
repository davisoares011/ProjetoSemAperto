package br.com.semaperto.dto;

import java.math.BigDecimal;

public record PontoEvolucao(int dia, BigDecimal receitas, BigDecimal despesas, BigDecimal saldo) {
}
