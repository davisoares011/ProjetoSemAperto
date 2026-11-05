package br.com.semaperto.config;

import br.com.semaperto.model.*;
import br.com.semaperto.repository.CategoriaRepository;
import br.com.semaperto.repository.LimiteRepository;
import br.com.semaperto.repository.MovimentacaoRepository;
import br.com.semaperto.repository.UsuarioRepository;
import br.com.semaperto.service.CategoriaService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Cria um usuário de demonstração ("joao") com alguns meses de dados,
 * só na primeira vez que o sistema roda. Útil pra apresentar o projeto.
 */
@Component
public class DadosIniciais implements CommandLineRunner {

    private final UsuarioRepository usuarios;
    private final CategoriaRepository categorias;
    private final MovimentacaoRepository movimentacoes;
    private final LimiteRepository limites;
    private final CategoriaService categoriaService;

    public DadosIniciais(UsuarioRepository usuarios, CategoriaRepository categorias,
                         MovimentacaoRepository movimentacoes, LimiteRepository limites,
                         CategoriaService categoriaService) {
        this.usuarios = usuarios;
        this.categorias = categorias;
        this.movimentacoes = movimentacoes;
        this.limites = limites;
        this.categoriaService = categoriaService;
    }

    @Override
    public void run(String... args) {
        if (usuarios.findByUsernameIgnoreCase("joao").isPresent()) {
            return;
        }

        Usuario joao = usuarios.save(new Usuario("joao", "João"));
        categoriaService.criarCategoriasPadrao(joao);
        Map<String, Categoria> c = categorias.findAllByUsuarioIdOrderByNome(joao.getId()).stream()
                .collect(Collectors.toMap(Categoria::getNome, Function.identity()));

        YearMonth atual = YearMonth.now();

        // Cinco meses anteriores com valores parecidos, pra os gráficos terem histórico
        String[][] historico = {
                {"3100", "2800", "3200", "2900", "2880"},
                {"0", "0", "0", "500", "0"}
        };
        for (int i = 5; i >= 1; i--) {
            YearMonth mes = atual.minusMonths(i);
            int idx = 5 - i;
            receita(joao, c.get("Salário"), "Salário", "5000", mes.atDay(5));
            if (!historico[1][idx].equals("0")) {
                receita(joao, c.get("Freelance"), "Freelance", historico[1][idx], mes.atDay(20));
            }
            BigDecimal totalDespesas = new BigDecimal(historico[0][idx]);
            despesa(joao, c.get("Moradia"), "Aluguel", "1200", mes.atDay(6), Frequencia.MENSAL);
            despesa(joao, c.get("Alimentação"), "Supermercado",
                    totalDespesas.subtract(new BigDecimal("1200")).subtract(new BigDecimal("480")).toPlainString(),
                    mes.atDay(12), Frequencia.UNICA);
            despesa(joao, c.get("Contas"), "Contas da casa", "480", mes.atDay(10), Frequencia.UNICA);
        }

        // Mês atual
        receita(joao, c.get("Salário"), "Salário", "5000", dia(atual, 5));
        receita(joao, c.get("Freelance"), "Freelance design", "2500", dia(atual, 14));
        despesa(joao, c.get("Moradia"), "Aluguel", "1200", dia(atual, 1), Frequencia.MENSAL);
        despesa(joao, c.get("Lazer"), "Netflix", "45.90", dia(atual, 5), Frequencia.MENSAL);
        despesa(joao, c.get("Transporte"), "Ônibus mensal", "168", dia(atual, 8), Frequencia.UNICA);
        despesa(joao, c.get("Contas"), "Internet", "99.90", dia(atual, 10), Frequencia.MENSAL);
        despesa(joao, c.get("Alimentação"), "Restaurante", "95", dia(atual, 11), Frequencia.UNICA);
        despesa(joao, c.get("Lazer"), "Academia", "90", dia(atual, 12), Frequencia.MENSAL);
        despesa(joao, c.get("Contas"), "Conta de energia", "180", dia(atual, 13), Frequencia.UNICA);
        despesa(joao, c.get("Alimentação"), "Supermercado", "350", dia(atual, 14), Frequencia.UNICA);
        despesa(joao, c.get("Transporte"), "Uber", "32", dia(atual, 17), Frequencia.UNICA);
        despesa(joao, c.get("Saúde"), "Farmácia", "85", dia(atual, 18), Frequencia.UNICA);

        limite(joao, c.get("Alimentação"), "800", atual);
        limite(joao, c.get("Transporte"), "500", atual);
        limite(joao, c.get("Lazer"), "400", atual);
        limite(joao, c.get("Contas"), "600", atual);
        limite(joao, c.get("Saúde"), "300", atual);
        limite(joao, c.get("Moradia"), "1200", atual);
    }

    private LocalDate dia(YearMonth mes, int dia) {
        return mes.atDay(Math.min(dia, mes.lengthOfMonth()));
    }

    private void receita(Usuario u, Categoria c, String descricao, String valor, LocalDate data) {
        movimentacoes.save(new Movimentacao(descricao, new BigDecimal(valor), data, TipoMovimentacao.RECEITA,
                "Conta corrente", null, Frequencia.UNICA, c, u));
    }

    private void despesa(Usuario u, Categoria c, String descricao, String valor, LocalDate data, Frequencia freq) {
        movimentacoes.save(new Movimentacao(descricao, new BigDecimal(valor), data, TipoMovimentacao.DESPESA,
                "Conta corrente", null, freq, c, u));
    }

    private void limite(Usuario u, Categoria c, String valor, YearMonth mes) {
        limites.save(new Limite(new BigDecimal(valor), mes, c, u));
    }
}
