package br.com.semaperto.service;

import br.com.semaperto.dto.*;
import br.com.semaperto.model.Categoria;
import br.com.semaperto.model.Limite;
import br.com.semaperto.model.Movimentacao;
import br.com.semaperto.model.TipoMovimentacao;
import br.com.semaperto.repository.LimiteRepository;
import br.com.semaperto.repository.MovimentacaoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.YearMonth;
import java.time.format.TextStyle;
import java.util.*;

@Service
public class ResumoService {

    private static final Locale PT_BR = Locale.forLanguageTag("pt-BR");

    private final MovimentacaoRepository movimentacoes;
    private final LimiteRepository limites;

    public ResumoService(MovimentacaoRepository movimentacoes, LimiteRepository limites) {
        this.movimentacoes = movimentacoes;
        this.limites = limites;
    }

    @Transactional(readOnly = true)
    public DashboardResponse dashboard(Long usuarioId, YearMonth mes) {
        List<Movimentacao> doMes = doMes(usuarioId, mes);
        List<Movimentacao> doMesAnterior = doMes(usuarioId, mes.minusMonths(1));

        BigDecimal receitas = somar(doMes, TipoMovimentacao.RECEITA);
        BigDecimal despesas = somar(doMes, TipoMovimentacao.DESPESA);

        List<Limite> limitesDoMes = limites.findAllByUsuarioIdAndMesReferenciaOrderByCategoriaNome(usuarioId, mes.toString());
        BigDecimal limiteTotal = limitesDoMes.stream().map(Limite::getValor).reduce(BigDecimal.ZERO, BigDecimal::add);

        Set<Long> categoriasComLimite = new HashSet<>();
        limitesDoMes.forEach(l -> categoriasComLimite.add(l.getCategoria().getId()));
        BigDecimal gastoComLimite = doMes.stream()
                .filter(m -> m.getTipo() == TipoMovimentacao.DESPESA)
                .filter(m -> categoriasComLimite.contains(m.getCategoria().getId()))
                .map(Movimentacao::getValor)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new DashboardResponse(
                mes.toString(),
                receitas.subtract(despesas),
                receitas,
                despesas,
                somar(doMesAnterior, TipoMovimentacao.RECEITA),
                somar(doMesAnterior, TipoMovimentacao.DESPESA),
                limiteTotal,
                limiteTotal.subtract(gastoComLimite),
                despesasPorCategoria(doMes),
                evolucao(doMes, mes),
                doMes.stream().limit(5).map(MovimentacaoResponse::de).toList()
        );
    }

    @Transactional(readOnly = true)
    public RelatorioResponse relatorio(Long usuarioId, YearMonth mes) {
        List<TotalMensal> meses = new ArrayList<>();
        for (int i = 5; i >= 0; i--) {
            YearMonth m = mes.minusMonths(i);
            List<Movimentacao> lista = doMes(usuarioId, m);
            BigDecimal r = somar(lista, TipoMovimentacao.RECEITA);
            BigDecimal d = somar(lista, TipoMovimentacao.DESPESA);
            String rotulo = m.getMonth().getDisplayName(TextStyle.SHORT, PT_BR).replace(".", "");
            meses.add(new TotalMensal(m.toString(), rotulo, r, d, r.subtract(d)));
        }

        List<Movimentacao> doMes = doMes(usuarioId, mes);
        BigDecimal receitas = somar(doMes, TipoMovimentacao.RECEITA);
        BigDecimal despesas = somar(doMes, TipoMovimentacao.DESPESA);
        return new RelatorioResponse(mes.toString(), receitas, despesas, receitas.subtract(despesas),
                meses, despesasPorCategoria(doMes));
    }

    private List<Movimentacao> doMes(Long usuarioId, YearMonth mes) {
        return movimentacoes.findAllByUsuarioIdAndDataBetweenOrderByDataDescIdDesc(
                usuarioId, mes.atDay(1), mes.atEndOfMonth());
    }

    private BigDecimal somar(List<Movimentacao> lista, TipoMovimentacao tipo) {
        return lista.stream()
                .filter(m -> m.getTipo() == tipo)
                .map(Movimentacao::getValor)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private List<TotalPorCategoria> despesasPorCategoria(List<Movimentacao> lista) {
        Map<Long, BigDecimal> totais = new LinkedHashMap<>();
        Map<Long, Categoria> categorias = new HashMap<>();
        for (Movimentacao m : lista) {
            if (m.getTipo() != TipoMovimentacao.DESPESA) continue;
            Categoria c = m.getCategoria();
            categorias.put(c.getId(), c);
            totais.merge(c.getId(), m.getValor(), BigDecimal::add);
        }
        return totais.entrySet().stream()
                .map(e -> {
                    Categoria c = categorias.get(e.getKey());
                    return new TotalPorCategoria(c.getNome(), c.getCor(), c.getIcone(), e.getValue());
                })
                .sorted(Comparator.comparing(TotalPorCategoria::valor).reversed())
                .toList();
    }

    private List<PontoEvolucao> evolucao(List<Movimentacao> doMes, YearMonth mes) {
        TreeMap<Integer, List<Movimentacao>> porDia = new TreeMap<>();
        for (Movimentacao m : doMes) {
            porDia.computeIfAbsent(m.getData().getDayOfMonth(), d -> new ArrayList<>()).add(m);
        }
        List<PontoEvolucao> pontos = new ArrayList<>();
        BigDecimal receitas = BigDecimal.ZERO;
        BigDecimal despesas = BigDecimal.ZERO;
        pontos.add(new PontoEvolucao(1, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO));
        for (Map.Entry<Integer, List<Movimentacao>> dia : porDia.entrySet()) {
            receitas = receitas.add(somar(dia.getValue(), TipoMovimentacao.RECEITA));
            despesas = despesas.add(somar(dia.getValue(), TipoMovimentacao.DESPESA));
            PontoEvolucao ponto = new PontoEvolucao(dia.getKey(), receitas, despesas, receitas.subtract(despesas));
            if (dia.getKey() == 1) {
                pontos.set(0, ponto);
            } else {
                pontos.add(ponto);
            }
        }
        return pontos;
    }
}
