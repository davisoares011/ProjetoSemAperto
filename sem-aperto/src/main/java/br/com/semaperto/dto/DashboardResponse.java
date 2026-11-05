package br.com.semaperto.dto;

import java.math.BigDecimal;
import java.util.List;

public record DashboardResponse(
        String mes,
        BigDecimal saldo,
        BigDecimal receitas,
        BigDecimal despesas,
        BigDecimal receitasMesAnterior,
        BigDecimal despesasMesAnterior,
        BigDecimal limiteTotal,
        BigDecimal limiteDisponivel,
        List<TotalPorCategoria> despesasPorCategoria,
        List<PontoEvolucao> evolucao,
        List<MovimentacaoResponse> ultimasMovimentacoes
) {
}
