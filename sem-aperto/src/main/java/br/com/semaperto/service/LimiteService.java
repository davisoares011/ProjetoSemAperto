package br.com.semaperto.service;

import br.com.semaperto.dto.LimiteRequest;
import br.com.semaperto.dto.LimiteResponse;
import br.com.semaperto.model.Categoria;
import br.com.semaperto.model.Limite;
import br.com.semaperto.model.Movimentacao;
import br.com.semaperto.model.TipoMovimentacao;
import br.com.semaperto.repository.LimiteRepository;
import br.com.semaperto.repository.MovimentacaoRepository;
import br.com.semaperto.repository.UsuarioRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.YearMonth;
import java.util.List;

@Service
public class LimiteService {

    private final LimiteRepository limites;
    private final MovimentacaoRepository movimentacoes;
    private final CategoriaService categoriaService;
    private final UsuarioRepository usuarios;

    public LimiteService(LimiteRepository limites, MovimentacaoRepository movimentacoes,
                         CategoriaService categoriaService, UsuarioRepository usuarios) {
        this.limites = limites;
        this.movimentacoes = movimentacoes;
        this.categoriaService = categoriaService;
        this.usuarios = usuarios;
    }

    /** Lista os limites do mês junto com quanto já foi gasto em cada categoria. */
    @Transactional(readOnly = true)
    public List<LimiteResponse> listar(Long usuarioId, YearMonth mes) {
        List<Movimentacao> despesasDoMes = movimentacoes
                .findAllByUsuarioIdAndDataBetweenOrderByDataDescIdDesc(usuarioId, mes.atDay(1), mes.atEndOfMonth())
                .stream()
                .filter(m -> m.getTipo() == TipoMovimentacao.DESPESA)
                .toList();

        return limites.findAllByUsuarioIdAndMesReferenciaOrderByCategoriaNome(usuarioId, mes.toString()).stream()
                .map(limite -> {
                    BigDecimal gasto = despesasDoMes.stream()
                            .filter(m -> m.getCategoria().getId().equals(limite.getCategoria().getId()))
                            .map(Movimentacao::getValor)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);
                    return paraResposta(limite, gasto);
                })
                .toList();
    }

    /** Se já existe limite pra essa categoria no mês, só troca o valor. Se não, cria. */
    @Transactional
    public void salvar(LimiteRequest dados, Long usuarioId) {
        YearMonth mes = Meses.ler(dados.mes());
        Categoria categoria = categoriaService.buscar(dados.categoriaId(), usuarioId);
        if (categoria.getTipo() != TipoMovimentacao.DESPESA) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Limites só podem ser definidos para categorias de despesa.");
        }
        Limite limite = limites
                .findByUsuarioIdAndCategoriaIdAndMesReferencia(usuarioId, categoria.getId(), mes.toString())
                .orElseGet(() -> new Limite(dados.valor(), mes, categoria, usuarios.getReferenceById(usuarioId)));
        limite.setValor(dados.valor());
        limites.save(limite);
    }

    @Transactional
    public void excluir(Long id, Long usuarioId) {
        Limite limite = limites.findByIdAndUsuarioId(id, usuarioId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Limite não encontrado."));
        limites.delete(limite);
    }

    private LimiteResponse paraResposta(Limite l, BigDecimal gasto) {
        Categoria c = l.getCategoria();
        return new LimiteResponse(l.getId(), l.getValor(), gasto, l.getMesReferencia(),
                c.getId(), c.getNome(), c.getIcone(), c.getCor());
    }
}
