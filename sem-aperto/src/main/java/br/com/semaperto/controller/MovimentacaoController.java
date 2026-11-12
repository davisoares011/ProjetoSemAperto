package br.com.semaperto.controller;

import br.com.semaperto.dto.MovimentacaoRequest;
import br.com.semaperto.dto.MovimentacaoResponse;
import br.com.semaperto.service.MovimentacaoService;
import br.com.semaperto.service.SessaoService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/movimentacoes")
public class MovimentacaoController {

    private final MovimentacaoService movimentacaoService;
    private final SessaoService sessaoService;

    public MovimentacaoController(MovimentacaoService movimentacaoService, SessaoService sessaoService) {
        this.movimentacaoService = movimentacaoService;
        this.sessaoService = sessaoService;
    }

    @GetMapping
    public List<MovimentacaoResponse> listar(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fim,
            HttpSession sessao) {
        return movimentacaoService.listar(sessaoService.usuarioId(sessao), inicio, fim);
    }

    @GetMapping("/{id}")
    public MovimentacaoResponse buscar(@PathVariable Long id, HttpSession sessao) {
        return movimentacaoService.buscar(id, sessaoService.usuarioId(sessao));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public MovimentacaoResponse criar(@Valid @RequestBody MovimentacaoRequest dados, HttpSession sessao) {
        return movimentacaoService.criar(dados, sessaoService.usuarioId(sessao));
    }

    @PutMapping("/{id}")
    public MovimentacaoResponse atualizar(@PathVariable Long id, @Valid @RequestBody MovimentacaoRequest dados,
                                          HttpSession sessao) {
        return movimentacaoService.atualizar(id, dados, sessaoService.usuarioId(sessao));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluir(@PathVariable Long id, HttpSession sessao) {
        movimentacaoService.excluir(id, sessaoService.usuarioId(sessao));
    }
}
