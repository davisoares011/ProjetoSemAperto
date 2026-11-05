package br.com.semaperto.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.YearMonth;

@Entity
@Table(name = "limites")
public class Limite {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal valor;

    // Guardado como texto no formato AAAA-MM (ex.: 2026-11)
    @Column(name = "mes_referencia", nullable = false, length = 7)
    private String mesReferencia;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "categoria_id")
    private Categoria categoria;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    protected Limite() {
    }

    public Limite(BigDecimal valor, YearMonth mes, Categoria categoria, Usuario usuario) {
        this.valor = valor;
        this.mesReferencia = mes.toString();
        this.categoria = categoria;
        this.usuario = usuario;
    }

    public Long getId() { return id; }
    public BigDecimal getValor() { return valor; }
    public String getMesReferencia() { return mesReferencia; }
    public Categoria getCategoria() { return categoria; }
    public Usuario getUsuario() { return usuario; }

    public void setValor(BigDecimal valor) { this.valor = valor; }
}
