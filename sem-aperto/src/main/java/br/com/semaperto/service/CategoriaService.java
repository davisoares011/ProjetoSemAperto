package br.com.semaperto.service;

import br.com.semaperto.dto.CategoriaRequest;
import br.com.semaperto.dto.CategoriaResponse;
import br.com.semaperto.model.Categoria;
import br.com.semaperto.model.Movimentacao;
import br.com.semaperto.model.TipoMovimentacao;
import br.com.semaperto.model.Usuario;
import br.com.semaperto.repository.CategoriaRepository;
import br.com.semaperto.repository.LimiteRepository;
import br.com.semaperto.repository.MovimentacaoRepository;
import br.com.semaperto.repository.UsuarioRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class CategoriaService {

    private final CategoriaRepository categorias;
    private final MovimentacaoRepository movimentacoes;
    private final LimiteRepository limites;
    private final UsuarioRepository usuarios;

    public CategoriaService(CategoriaRepository categorias, MovimentacaoRepository movimentacoes,
                            LimiteRepository limites, UsuarioRepository usuarios) {
        this.categorias = categorias;
        this.movimentacoes = movimentacoes;
        this.limites = limites;
        this.usuarios = usuarios;
    }

    @Transactional(readOnly = true)
    public List<CategoriaResponse> listar(Long usuarioId) {
        List<Movimentacao> todas = movimentacoes.findAllByUsuarioIdOrderByDataDescIdDesc(usuarioId);
        Map<Long, List<Movimentacao>> porCategoria = todas.stream()
                .collect(Collectors.groupingBy(m -> m.getCategoria().getId()));

        return categorias.findAllByUsuarioIdOrderByNome(usuarioId).stream()
                .map(c -> {
                    List<Movimentacao> lista = porCategoria.getOrDefault(c.getId(), List.of());
                    BigDecimal total = lista.stream().map(Movimentacao::getValor)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);
                    return new CategoriaResponse(c.getId(), c.getNome(), c.getTipo(), c.getCor(), c.getIcone(),
                            lista.size(), total);
                })
                .toList();
    }

    @Transactional
    public CategoriaResponse criar(CategoriaRequest dados, Long usuarioId) {
        String nome = dados.nome().trim();
        if (categorias.existsByUsuarioIdAndNomeIgnoreCase(usuarioId, nome)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Você já tem uma categoria com esse nome.");
        }
        Usuario usuario = usuarios.getReferenceById(usuarioId);
        Categoria salva = categorias.save(new Categoria(nome, dados.tipo(), dados.cor(), dados.icone(), usuario));
        return new CategoriaResponse(salva.getId(), salva.getNome(), salva.getTipo(), salva.getCor(),
                salva.getIcone(), 0, BigDecimal.ZERO);
    }

    @Transactional
    public void atualizar(Long id, CategoriaRequest dados, Long usuarioId) {
        Categoria categoria = buscar(id, usuarioId);
        String nome = dados.nome().trim();
        if (categorias.existsByUsuarioIdAndNomeIgnoreCaseAndIdNot(usuarioId, nome, id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Você já tem uma categoria com esse nome.");
        }
        if (categoria.getTipo() != dados.tipo() && movimentacoes.existsByCategoriaId(id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Não dá para trocar o tipo de uma categoria que já tem movimentações.");
        }
        categoria.atualizar(nome, dados.tipo(), dados.cor(), dados.icone());
    }

    @Transactional
    public void excluir(Long id, Long usuarioId) {
        Categoria categoria = buscar(id, usuarioId);
        if (movimentacoes.existsByCategoriaId(id) || limites.existsByCategoriaId(id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Essa categoria tem movimentações ou limites e não pode ser excluída.");
        }
        categorias.delete(categoria);
    }

    public Categoria buscar(Long id, Long usuarioId) {
        return categorias.findByIdAndUsuarioId(id, usuarioId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Categoria não encontrada."));
    }

    @Transactional
    public void criarCategoriasPadrao(Usuario usuario) {
        salvar(usuario, "Moradia", TipoMovimentacao.DESPESA, "#1675A5", "🏠");
        salvar(usuario, "Alimentação", TipoMovimentacao.DESPESA, "#2BA889", "🍽️");
        salvar(usuario, "Contas", TipoMovimentacao.DESPESA, "#155A7D", "📄");
        salvar(usuario, "Transporte", TipoMovimentacao.DESPESA, "#F2B84B", "🚗");
        salvar(usuario, "Lazer", TipoMovimentacao.DESPESA, "#55B978", "🎮");
        salvar(usuario, "Saúde", TipoMovimentacao.DESPESA, "#E85D5D", "💊");
        salvar(usuario, "Educação", TipoMovimentacao.DESPESA, "#8B5CF6", "📚");
        salvar(usuario, "Salário", TipoMovimentacao.RECEITA, "#2BA889", "💰");
        salvar(usuario, "Freelance", TipoMovimentacao.RECEITA, "#1675A5", "💻");
    }

    private void salvar(Usuario usuario, String nome, TipoMovimentacao tipo, String cor, String icone) {
        categorias.save(new Categoria(nome, tipo, cor, icone, usuario));
    }
}
