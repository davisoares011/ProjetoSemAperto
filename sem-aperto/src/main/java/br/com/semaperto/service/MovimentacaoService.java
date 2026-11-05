package br.com.semaperto.service;

import br.com.semaperto.dto.MovimentacaoRequest;
import br.com.semaperto.dto.MovimentacaoResponse;
import br.com.semaperto.model.Categoria;
import br.com.semaperto.model.Movimentacao;
import br.com.semaperto.repository.MovimentacaoRepository;
import br.com.semaperto.repository.UsuarioRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;

@Service
public class MovimentacaoService {

    private final MovimentacaoRepository movimentacoes;
    private final CategoriaService categoriaService;
    private final UsuarioRepository usuarios;

    public MovimentacaoService(MovimentacaoRepository movimentacoes, CategoriaService categoriaService,
                               UsuarioRepository usuarios) {
        this.movimentacoes = movimentacoes;
        this.categoriaService = categoriaService;
        this.usuarios = usuarios;
    }

    @Transactional(readOnly = true)
    public List<MovimentacaoResponse> listar(Long usuarioId, LocalDate inicio, LocalDate fim) {
        List<Movimentacao> lista = (inicio != null && fim != null)
                ? movimentacoes.findAllByUsuarioIdAndDataBetweenOrderByDataDescIdDesc(usuarioId, inicio, fim)
                : movimentacoes.findAllByUsuarioIdOrderByDataDescIdDesc(usuarioId);
        return lista.stream().map(MovimentacaoResponse::de).toList();
    }

    @Transactional(readOnly = true)
    public MovimentacaoResponse buscar(Long id, Long usuarioId) {
        return MovimentacaoResponse.de(buscarEntidade(id, usuarioId));
    }

    @Transactional
    public MovimentacaoResponse criar(MovimentacaoRequest dados, Long usuarioId) {
        Categoria categoria = categoriaValida(dados, usuarioId);
        Movimentacao nova = new Movimentacao(dados.descricao().trim(), dados.valor(), dados.data(), dados.tipo(),
                dados.conta(), limpar(dados.observacao()), dados.frequencia(), categoria,
                usuarios.getReferenceById(usuarioId));
        return MovimentacaoResponse.de(movimentacoes.save(nova));
    }

    @Transactional
    public MovimentacaoResponse atualizar(Long id, MovimentacaoRequest dados, Long usuarioId) {
        Movimentacao mov = buscarEntidade(id, usuarioId);
        Categoria categoria = categoriaValida(dados, usuarioId);
        mov.atualizar(dados.descricao().trim(), dados.valor(), dados.data(), dados.tipo(),
                dados.conta(), limpar(dados.observacao()), dados.frequencia(), categoria);
        return MovimentacaoResponse.de(mov);
    }

    @Transactional
    public void excluir(Long id, Long usuarioId) {
        movimentacoes.delete(buscarEntidade(id, usuarioId));
    }

    private Movimentacao buscarEntidade(Long id, Long usuarioId) {
        return movimentacoes.findByIdAndUsuarioId(id, usuarioId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Movimentação não encontrada."));
    }

    /** A categoria precisa ser do usuário e do mesmo tipo (receita com receita, despesa com despesa). */
    private Categoria categoriaValida(MovimentacaoRequest dados, Long usuarioId) {
        Categoria categoria = categoriaService.buscar(dados.categoriaId(), usuarioId);
        if (categoria.getTipo() != dados.tipo()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "A categoria escolhida não é do mesmo tipo da movimentação.");
        }
        return categoria;
    }

    private String limpar(String texto) {
        return (texto == null || texto.isBlank()) ? null : texto.trim();
    }
}
