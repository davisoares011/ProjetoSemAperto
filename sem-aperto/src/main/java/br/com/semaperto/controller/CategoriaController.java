package br.com.semaperto.controller;

import br.com.semaperto.dto.CategoriaRequest;
import br.com.semaperto.dto.CategoriaResponse;
import br.com.semaperto.service.CategoriaService;
import br.com.semaperto.service.SessaoService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categorias")
public class CategoriaController {

    private final CategoriaService categoriaService;
    private final SessaoService sessaoService;

    public CategoriaController(CategoriaService categoriaService, SessaoService sessaoService) {
        this.categoriaService = categoriaService;
        this.sessaoService = sessaoService;
    }

    @GetMapping
    public List<CategoriaResponse> listar(HttpSession sessao) {
        return categoriaService.listar(sessaoService.usuarioId(sessao));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CategoriaResponse criar(@Valid @RequestBody CategoriaRequest dados, HttpSession sessao) {
        return categoriaService.criar(dados, sessaoService.usuarioId(sessao));
    }

    @PutMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void atualizar(@PathVariable Long id, @Valid @RequestBody CategoriaRequest dados, HttpSession sessao) {
        categoriaService.atualizar(id, dados, sessaoService.usuarioId(sessao));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluir(@PathVariable Long id, HttpSession sessao) {
        categoriaService.excluir(id, sessaoService.usuarioId(sessao));
    }
}
