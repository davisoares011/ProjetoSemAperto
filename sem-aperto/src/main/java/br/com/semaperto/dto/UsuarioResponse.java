package br.com.semaperto.dto;

import br.com.semaperto.model.Usuario;

public record UsuarioResponse(Long id, String username, String apelido) {

    public static UsuarioResponse de(Usuario usuario) {
        return new UsuarioResponse(usuario.getId(), usuario.getUsername(), usuario.getApelido());
    }
}
