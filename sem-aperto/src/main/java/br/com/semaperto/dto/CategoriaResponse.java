package br.com.semaperto.dto;

import br.com.semaperto.model.TipoMovimentacao;

import java.math.BigDecimal;

public record CategoriaResponse(Long id, String nome, TipoMovimentacao tipo, String cor, String icone,
                                long quantidade, BigDecimal total) {
}
