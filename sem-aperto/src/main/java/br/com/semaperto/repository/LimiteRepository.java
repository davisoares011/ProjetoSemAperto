package br.com.semaperto.repository;

import br.com.semaperto.model.Limite;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LimiteRepository extends JpaRepository<Limite, Long> {

    List<Limite> findAllByUsuarioIdAndMesReferenciaOrderByCategoriaNome(Long usuarioId, String mes);

    Optional<Limite> findByUsuarioIdAndCategoriaIdAndMesReferencia(Long usuarioId, Long categoriaId, String mes);

    Optional<Limite> findByIdAndUsuarioId(Long id, Long usuarioId);

    boolean existsByCategoriaId(Long categoriaId);
}
