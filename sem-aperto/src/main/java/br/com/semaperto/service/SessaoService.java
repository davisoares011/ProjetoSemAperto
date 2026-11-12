package br.com.semaperto.service;

import br.com.semaperto.dto.EntradaRequest;
import br.com.semaperto.model.Usuario;
import br.com.semaperto.repository.UsuarioRepository;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class SessaoService {

    public static final String ATRIBUTO_USUARIO = "usuarioId";

    private final UsuarioRepository usuarios;
    private final CategoriaService categoriaService;

    public SessaoService(UsuarioRepository usuarios, CategoriaService categoriaService) {
        this.usuarios = usuarios;
        this.categoriaService = categoriaService;
    }

    @Transactional
    public Usuario entrar(EntradaRequest dados, HttpSession sessao) {
        String username = dados.username().trim().toLowerCase();
        String apelido = dados.apelido().trim();

        Usuario usuario = usuarios.findByUsernameIgnoreCase(username)
                .map(existente -> {
                    existente.setApelido(apelido);
                    return existente;
                })
                .orElseGet(() -> {
                    Usuario novo = usuarios.save(new Usuario(username, apelido));
                    categoriaService.criarCategoriasPadrao(novo);
                    return novo;
                });

        sessao.setAttribute(ATRIBUTO_USUARIO, usuario.getId());
        return usuario;
    }

    public void sair(HttpSession sessao) {
        sessao.invalidate();
    }

    public Long usuarioId(HttpSession sessao) {
        Object id = sessao.getAttribute(ATRIBUTO_USUARIO);
        if (id == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Entre no sistema para continuar.");
        }
        return (Long) id;
    }

    public Usuario usuarioLogado(HttpSession sessao) {
        return usuarios.findById(usuarioId(sessao))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Entre no sistema para continuar."));
    }
}
