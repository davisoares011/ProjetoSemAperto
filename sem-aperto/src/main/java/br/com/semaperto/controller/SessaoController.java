package br.com.semaperto.controller;

import br.com.semaperto.dto.EntradaRequest;
import br.com.semaperto.dto.UsuarioResponse;
import br.com.semaperto.service.SessaoService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/sessao")
public class SessaoController {

    private final SessaoService sessaoService;

    public SessaoController(SessaoService sessaoService) {
        this.sessaoService = sessaoService;
    }

    /** Tela de entrada: recebe usuário + apelido e abre a sessão. */
    @PostMapping
    public UsuarioResponse entrar(@Valid @RequestBody EntradaRequest dados, HttpSession sessao) {
        return UsuarioResponse.de(sessaoService.entrar(dados, sessao));
    }

    /** Diz quem está usando o sistema agora (ou 401 se ninguém entrou). */
    @GetMapping
    public UsuarioResponse atual(HttpSession sessao) {
        return UsuarioResponse.de(sessaoService.usuarioLogado(sessao));
    }

    @DeleteMapping
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void sair(HttpSession sessao) {
        sessaoService.sair(sessao);
    }
}
