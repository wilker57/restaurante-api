package ifmt.cba.restaurante.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;

import ifmt.cba.restaurante.entity.GrupoAlimentar;
import ifmt.cba.restaurante.entity.Produto;
import jakarta.persistence.LockModeType;

public interface ProdutoRepository extends JpaRepository<Produto, Integer>{

    Produto findByNomeIgnoreCaseStartingWith(String nome);
    Produto findByCodigoBarras(String codigoBarras);
    List<Produto> findByGrupoAlimentar(GrupoAlimentar grupoAlimentar);

    @Query("select p from Produto p where p.estoque < p.estoqueMinimo")
    List<Produto> findByEstoqueMenorEstoqueMinimo();

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select p from Produto p where p.codigo = :codigo")
    Optional<Produto> findByIdForUpdate(int codigo);

}
