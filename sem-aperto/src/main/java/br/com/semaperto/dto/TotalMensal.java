package br.com.semaperto.dto;

import java.math.BigDecimal;

public record TotalMensal(String mes, String rotulo, BigDecimal receitas, BigDecimal despesas, BigDecimal saldo) {
}
