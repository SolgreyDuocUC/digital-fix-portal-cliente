package df.portal.cl.repository;

import df.portal.cl.model.productos.TipoItemTienda;
import df.portal.cl.model.resenias.CategoriaResenia;
import df.portal.cl.model.resenias.EstadoResenia;
import df.portal.cl.model.resenias.Resenia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReseniaRepository extends JpaRepository<Resenia, Long> {

    List<Resenia> findByTipoItemAndIdMicroservicioAndEstadoOrderByFechaCreacionDesc(
            TipoItemTienda tipoItem,
            Long idMicroservicio,
            EstadoResenia estado
    );

    List<Resenia> findByEstadoOrderByFechaCreacionDesc(EstadoResenia estado);

    List<Resenia> findByCategoriaAndEstadoOrderByFechaCreacionDesc(
            CategoriaResenia categoria,
            EstadoResenia estado
    );

    List<Resenia> findAllByOrderByFechaCreacionDesc();

    long countByTipoItemAndIdMicroservicioAndEstado(
            TipoItemTienda tipoItem,
            Long idMicroservicio,
            EstadoResenia estado
    );

    long countByCategoria(CategoriaResenia categoria);

    long countByCalificacion(Integer calificacion);

    long countByTipoItemAndIdMicroservicioAndCalificacionAndEstado(
            TipoItemTienda tipoItem,
            Long idMicroservicio,
            Integer calificacion,
            EstadoResenia estado
    );

    @Query("SELECT AVG(r.calificacion) FROM Resenia r WHERE r.tipoItem = :tipoItem AND r.idMicroservicio = :idMicroservicio AND r.estado = :estado")
    Double calcularPromedioCalificacionPorItem(
            @Param("tipoItem") TipoItemTienda tipoItem,
            @Param("idMicroservicio") Long idMicroservicio,
            @Param("estado") EstadoResenia estado
    );

    @Query("SELECT AVG(r.calificacion) FROM Resenia r WHERE r.estado = :estado")
    Double calcularPromedioCalificacionGeneral(@Param("estado") EstadoResenia estado);
}

