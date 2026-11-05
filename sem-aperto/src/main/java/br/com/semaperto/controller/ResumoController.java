package br.com.semaperto.controller;

import br.com.semaperto.dto.DashboardResponse;
import br.com.semaperto.dto.RelatorioResponse;
import br.com.semaperto.service.Meses;
import br.com.semaperto.service.ResumoService;
import br.com.semaperto.service.SessaoService;
import jakarta.servlet.http.HttpSession;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class ResumoController {

    private final ResumoService resumoService;
    private final SessaoService sessaoService;

    public ResumoController(ResumoService resumoService, SessaoService sessaoService) {
        this.resumoService = resumoService;
        this.sessaoService = sessaoService;
    }

    @GetMapping("/dashboard")
    public DashboardResponse dashboard(@RequestParam(required = false) String mes, HttpSession sessao) {
        return resumoService.dashboard(sessaoService.usuarioId(sessao), Meses.ler(mes));
    }

    @GetMapping("/relatorios")
    public RelatorioResponse relatorios(@RequestParam(required = false) String mes, HttpSession sessao) {
        return resumoService.relatorio(sessaoService.usuarioId(sessao), Meses.ler(mes));
    }
}
