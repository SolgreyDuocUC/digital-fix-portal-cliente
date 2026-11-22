package df.portal.cl.services.Resenia;

import df.portal.cl.dto.resenias.CrearReseniaDTO;
import df.portal.cl.dto.resenias.RegistrarAccionMejoraDTO;
import df.portal.cl.dto.resenias.ReseniaResponseDTO;
import df.portal.cl.dto.resenias.ResumenCalificacionesDTO;
import df.portal.cl.model.productos.TipoItemTienda;
import df.portal.cl.model.resenias.CategoriaResenia;
import df.portal.cl.model.resenias.EstadoResenia;
import df.portal.cl.model.resenias.Resenia;
import df.portal.cl.model.usuarios.Usuario;
import df.portal.cl.repository.ReseniaRepository;
import df.portal.cl.repository.UsuarioRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReseniaServiceImplTest {

    @Mock
    private ReseniaRepository reseniaRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    @InjectMocks
    private ReseniaServiceImpl reseniaService;

    @Test
    @DisplayName("Crear reseña sin usuario autenticado deduce categoría según estrellas")
    void crearReseniaSinUsuario() {
        CrearReseniaDTO dto = new CrearReseniaDTO(
                2L,
                TipoItemTienda.SERVICIO,
                "SRV-TAB-02",
                "Mantención Preventiva Tablero TDA",
                "Juan Pérez",
                "Maipú",
                5,
                "Excelente trabajo",
                "El técnico solucionó el cortocircuito en menos de 1 hora.",
                null
        );

        when(reseniaRepository.save(any(Resenia.class))).thenAnswer(invocation -> {
            Resenia r = invocation.getArgument(0);
            r.setIdResenia(10L);
            return r;
        });

        ReseniaResponseDTO response = reseniaService.crear(dto, null);

        assertThat(response.idResenia()).isEqualTo(10L);
        assertThat(response.categoria()).isEqualTo(CategoriaResenia.FELICITACION);
        assertThat(response.calificacion()).isEqualTo(5);
        assertThat(response.compraVerificada()).isFalse();
        verify(reseniaRepository).save(any(Resenia.class));
    }

    @Test
    @DisplayName("Crear reseña con usuario autenticado marca compra verificada")
    void crearReseniaConUsuarioAutenticado() {
        Usuario usuario = Usuario.builder()
                .idUsuario(1L)
                .nombre("Comercial Rojas")
                .apellidos("Ltda")
                .comuna("Providencia")
                .email("contacto@rojas.cl")
                .build();

        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuario));

        CrearReseniaDTO dto = new CrearReseniaDTO(
                7L,
                TipoItemTienda.REPUESTO,
                "REP-DIF-25",
                "Interruptor Diferencial 25A Schneider",
                null,
                null,
                4,
                "Buen repuesto",
                "Repuesto original SEC instalado sin problemas.",
                null
        );

        when(reseniaRepository.save(any(Resenia.class))).thenAnswer(invocation -> {
            Resenia r = invocation.getArgument(0);
            r.setIdResenia(20L);
            return r;
        });

        ReseniaResponseDTO response = reseniaService.crear(dto, 1L);

        assertThat(response.idResenia()).isEqualTo(20L);
        assertThat(response.nombreCliente()).isEqualTo("Comercial Rojas Ltda");
        assertThat(response.comuna()).isEqualTo("Providencia");
        assertThat(response.compraVerificada()).isTrue();
    }

    @Test
    @DisplayName("Obtener resumen de calificaciones por ítem calcula promedio y desglose")
    void obtenerResumenCalificacionesPorItem() {
        when(reseniaRepository.calcularPromedioCalificacionPorItem(TipoItemTienda.SERVICIO, 2L, EstadoResenia.PUBLICADA))
                .thenReturn(4.76);
        when(reseniaRepository.countByTipoItemAndIdMicroservicioAndEstado(TipoItemTienda.SERVICIO, 2L, EstadoResenia.PUBLICADA))
                .thenReturn(25L);

        Resenia r1 = Resenia.builder().categoria(CategoriaResenia.FELICITACION).build();
        Resenia r2 = Resenia.builder().categoria(CategoriaResenia.MEJORA).build();
        when(reseniaRepository.findByTipoItemAndIdMicroservicioAndEstadoOrderByFechaCreacionDesc(
                TipoItemTienda.SERVICIO, 2L, EstadoResenia.PUBLICADA
        )).thenReturn(List.of(r1, r2));

        ResumenCalificacionesDTO resumen = reseniaService.obtenerResumenCalificacionesPorItem(TipoItemTienda.SERVICIO, 2L);

        assertThat(resumen.promedioEstrellas()).isEqualTo(4.8);
        assertThat(resumen.totalResenias()).isEqualTo(25L);
        assertThat(resumen.totalFelicitaciones()).isEqualTo(1L);
        assertThat(resumen.totalMejoras()).isEqualTo(1L);
    }

    @Test
    @DisplayName("Registrar plan de acción u oportunidad de mejora sobre una crítica")
    void registrarAccionMejora() {
        Resenia resenia = Resenia.builder()
                .idResenia(5L)
                .calificacion(2)
                .categoria(CategoriaResenia.CRITICA)
                .comentario("Demora excesiva en llegar al domicilio")
                .estado(EstadoResenia.PUBLICADA)
                .fechaCreacion(OffsetDateTime.now())
                .build();

        when(reseniaRepository.findById(5L)).thenReturn(Optional.of(resenia));

        RegistrarAccionMejoraDTO dto = new RegistrarAccionMejoraDTO(
                "Incorporar motos de respuesta rápida en cuadrillas del centro",
                "Carlos Henríquez"
        );

        ReseniaResponseDTO response = reseniaService.registrarAccionMejora(5L, dto, "Carlos Henríquez");

        assertThat(response.planAccionMejora())
                .isEqualTo("Incorporar motos de respuesta rápida en cuadrillas del centro");
        assertThat(response.usuarioAccionMejora()).isEqualTo("Carlos Henríquez");
    }
}

