package df.portal.cl.repository;

import df.portal.cl.model.pedidos.Pedido;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PedidoRepository extends JpaRepository<Pedido, Long> {

    @EntityGraph(attributePaths = "items")
    List<Pedido> findByUsuario_IdUsuarioOrderByFechaCreacionDesc(Long idUsuario);

    @EntityGraph(attributePaths = "items")
    Optional<Pedido> findByCodigoAndUsuario_IdUsuario(String codigo, Long idUsuario);

    boolean existsByCodigo(String codigo);
}
