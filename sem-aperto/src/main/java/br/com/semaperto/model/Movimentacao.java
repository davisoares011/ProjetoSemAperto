package br.com.semaperto.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "movimentacoes")
public class Movimentacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 140)
    private String descricao;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal valor;

    @Column(nullable = false)
    private LocalDate data;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private TipoMovimentacao tipo;

    @Column(nullable = false, length = 80)
    private String conta;

    @Column(length = 500)
    private String observacao;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private Frequencia frequencia;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "categoria_id")
    private Categoria categoria;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    protected Movimentacao() {
    }

    public Movimentacao(String descricao, BigDecimal valor, LocalDate data, TipoMovimentacao tipo,
                        String conta, String observacao, Frequencia frequencia,
                        Categoria categoria, Usuario usuario) {
        atualizar(descricao, valor, data, tipo, conta, observacao, frequencia, categoria);
        this.usuario = usuario;
    }

    public void atualizar(String descricao, BigDecimal valor, LocalDate data, TipoMovimentacao tipo,
                          String conta, String observacao, Frequencia frequencia, Categoria categoria) {
        this.descricao = descricao;
        this.valor = valor.abs();
        this.data = data;
        this.tipo = tipo;
        this.conta = conta;
        this.observacao = observacao;
        this.frequencia = frequencia;
        this.categoria = categoria;
    }

    public Long getId() { return id; }
    public String getDescricao() { return descricao; }
    public BigDecimal getValor() { return valor; }
    public LocalDate getData() { return data; }
    public TipoMovimentacao getTipo() { return tipo; }
    public String getConta() { return conta; }
    public String getObservacao() { return observacao; }
    public Frequencia getFrequencia() { return frequencia; }
    public Categoria getCategoria() { return categoria; }
    public Usuario getUsuario() { return usuario; }
}
