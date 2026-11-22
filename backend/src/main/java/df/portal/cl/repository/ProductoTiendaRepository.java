package df.portal.cl.repository;

import df.portal.cl.model.productos.ProductoTienda;
import df.portal.cl.model.productos.TipoItemTienda;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProductoTiendaRepository extends JpaRepository<ProductoTienda, Long> {

    List<ProductoTienda> findByTipoItem(TipoItemTienda tipoItem);

    Optional<ProductoTienda> findByTipoItemAndIdMicroservicio(TipoItemTienda tipoItem, Long idMicroservicio);
}
