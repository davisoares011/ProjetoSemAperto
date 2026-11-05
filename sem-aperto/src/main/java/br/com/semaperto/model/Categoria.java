package br.com.semaperto.model;

import jakarta.persistence.*;

@Entity
@Table(name = "categorias")
public class Categoria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 80)
    private String nome;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private TipoMovimentacao tipo;

    @Column(nullable = false, length = 16)
    private String cor;

    @Column(nullable = false, length = 16)
    private String icone;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    protected Categoria() {
    }

    public Categoria(String nome, TipoMovimentacao tipo, String cor, String icone, Usuario usuario) {
        atualizar(nome, tipo, cor, icone);
        this.usuario = usuario;
    }

    public void atualizar(String nome, TipoMovimentacao tipo, String cor, String icone) {
        this.nome = nome;
        this.tipo = tipo;
        this.cor = cor;
        this.icone = icone;
    }

    public Long getId() { return id; }
    public String getNome() { return nome; }
    public TipoMovimentacao getTipo() { return tipo; }
    public String getCor() { return cor; }
    public String getIcone() { return icone; }
    public Usuario getUsuario() { return usuario; }
}
