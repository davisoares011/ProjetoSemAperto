package br.com.semaperto.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "usuarios")
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 40)
    private String username;

    @Column(nullable = false, length = 60)
    private String apelido;

    @Column(name = "criado_em", nullable = false)
    private LocalDateTime criadoEm;

    protected Usuario() {
    }

    public Usuario(String username, String apelido) {
        this.username = username;
        this.apelido = apelido;
        this.criadoEm = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public String getUsername() { return username; }
    public String getApelido() { return apelido; }
    public LocalDateTime getCriadoEm() { return criadoEm; }

    public void setApelido(String apelido) { this.apelido = apelido; }
}
