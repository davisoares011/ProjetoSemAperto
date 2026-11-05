package br.com.semaperto.repository;

import br.com.semaperto.model.Movimentacao;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface MovimentacaoRepository extends JpaRepository<Movimentacao, Long> {

    List<Movimentacao> findAllByUsuarioIdOrderByDataDescIdDesc(Long usuarioId);

    List<Movimentacao> findAllByUsuarioIdAndDataBetweenOrderByDataDescIdDesc(
            Long usuarioId, LocalDate inicio, LocalDate fim);

    Optional<Movimentacao> findByIdAndUsuarioId(Long id, Long usuarioId);

    boolean existsByCategoriaId(Long categoriaId);
}
