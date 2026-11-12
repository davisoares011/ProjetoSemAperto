package br.com.semaperto.controller;

import br.com.semaperto.dto.LimiteRequest;
import br.com.semaperto.dto.LimiteResponse;
import br.com.semaperto.service.LimiteService;
import br.com.semaperto.service.Meses;
import br.com.semaperto.service.SessaoService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/limites")
public class LimiteController {

    private final LimiteService limiteService;
    private final SessaoService sessaoService;

    public LimiteController(LimiteService limiteService, SessaoService sessaoService) {
        this.limiteService = limiteService;
        this.sessaoService = sessaoService;
    }

    @GetMapping
    public List<LimiteResponse> listar(@RequestParam(required = false) String mes, HttpSession sessao) {
        return limiteService.listar(sessaoService.usuarioId(sessao), Meses.ler(mes));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void salvar(@Valid @RequestBody LimiteRequest dados, HttpSession sessao) {
        limiteService.salvar(dados, sessaoService.usuarioId(sessao));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluir(@PathVariable Long id, HttpSession sessao) {
        limiteService.excluir(id, sessaoService.usuarioId(sessao));
    }
}
