package br.com.semaperto.service;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.YearMonth;
import java.time.format.DateTimeParseException;

/** Ajuda a ler o mês que vem da tela no formato AAAA-MM. */
public final class Meses {

    private Meses() {
    }

    /** Se o mês vier vazio, usa o mês atual. */
    public static YearMonth ler(String valor) {
        if (valor == null || valor.isBlank()) {
            return YearMonth.now();
        }
        try {
            return YearMonth.parse(valor.trim());
        } catch (DateTimeParseException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O mês deve estar no formato AAAA-MM.");
        }
    }
}
