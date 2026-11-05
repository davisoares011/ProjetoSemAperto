package br.com.semaperto.dto;

import br.com.semaperto.model.Categoria;
import br.com.semaperto.model.Frequencia;
import br.com.semaperto.model.Movimentacao;
import br.com.semaperto.model.TipoMovimentacao;

import java.math.BigDecimal;
import java.time.LocalDate;

public record MovimentacaoResponse(
        Long id, String descricao, BigDecimal valor, LocalDate data, TipoMovimentacao tipo,
        String conta, String observacao, Frequencia frequencia,
        Long categoriaId, String categoriaNome, String categoriaIcone, String categoriaCor
) {

    public static MovimentacaoResponse de(Movimentacao m) {
        Categoria c = m.getCategoria();
        return new MovimentacaoResponse(m.getId(), m.getDescricao(), m.getValor(), m.getData(), m.getTipo(),
                m.getConta(), m.getObservacao(), m.getFrequencia(),
                c.getId(), c.getNome(), c.getIcone(), c.getCor());
    }
}
