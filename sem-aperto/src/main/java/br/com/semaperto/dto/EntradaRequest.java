package br.com.semaperto.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** Dados da tela de entrada: só o nome de usuário e o nome/apelido. */
public record EntradaRequest(
        @NotBlank(message = "Informe o nome de usuário.")
        @Pattern(regexp = "^[a-zA-Z0-9._-]{3,40}$",
                 message = "O usuário deve ter de 3 a 40 caracteres, sem espaços (letras, números, ponto, _ ou -).")
        String username,

        @NotBlank(message = "Informe seu nome ou apelido.")
        @Size(max = 60, message = "O nome/apelido pode ter no máximo 60 caracteres.")
        String apelido
) {
}
