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
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional
public class ReseniaServiceImpl implements ReseniaService {

    private final ReseniaRepository reseniaRepository;
    private final UsuarioRepository usuarioRepository;

    @Override
    public ReseniaResponseDTO crear(CrearReseniaDTO dto, Long idUsuarioAutenticado) {
        CategoriaResenia categoriaFinal = dto.categoria() != null
                ? dto.categoria()
                : CategoriaResenia.inferirPorEstrellas(dto.calificacion());

        String nombreClienteFinal = dto.nombreCliente();
        String comunaFinal = dto.comuna();
        boolean compraVerificada = false;

        if (idUsuarioAutenticado != null) {
            Usuario usuario = usuarioRepository.findById(idUsuarioAutenticado).orElse(null);
            if (usuario != null) {
                if (nombreClienteFinal == null || nombreClienteFinal.isBlank()) {
                    nombreClienteFinal = usuario.getNombre() + (usuario.getApellidos() != null ? " " + usuario.getApellidos() : "");
                }
                if (comunaFinal == null || comunaFinal.isBlank()) {
                    comunaFinal = usuario.getComuna();
                }
                compraVerificada = true;
            }
        }

        Resenia resenia = Resenia.builder()
                .idMicroservicio(dto.idMicroservicio())
                .tipoItem(dto.tipoItem())
                .codigoItem(dto.codigoItem())
                .nombreItem(dto.nombreItem() != null ? dto.nombreItem() : "Servicio o Repuesto Eléctrico")
                .idUsuario(idUsuarioAutenticado)
                .nombreCliente(nombreClienteFinal != null ? nombreClienteFinal : "Cliente DigitalFix")
                .comuna(comunaFinal != null ? comunaFinal : "Región Metropolitana")
                .calificacion(dto.calificacion())
                .titulo(dto.titulo())
                .comentario(dto.comentario())
                .categoria(categoriaFinal)
                .estado(EstadoResenia.PUBLICADA)
                .compraVerificada(compraVerificada)
                .fechaCreacion(OffsetDateTime.now())
                .build();

        Resenia guardada = reseniaRepository.save(resenia);
        return ReseniaResponseDTO.fromEntity(guardada);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReseniaResponseDTO> listarPublicadasPorItem(TipoItemTienda tipoItem, Long idMicroservicio) {
        return reseniaRepository
                .findByTipoItemAndIdMicroservicioAndEstadoOrderByFechaCreacionDesc(tipoItem, idMicroservicio, EstadoResenia.PUBLICADA)
                .stream()
                .map(ReseniaResponseDTO::fromEntity)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ResumenCalificacionesDTO obtenerResumenCalificacionesPorItem(TipoItemTienda tipoItem, Long idMicroservicio) {
        Double promedio = reseniaRepository.calcularPromedioCalificacionPorItem(tipoItem, idMicroservicio, EstadoResenia.PUBLICADA);
        long total = reseniaRepository.countByTipoItemAndIdMicroservicioAndEstado(tipoItem, idMicroservicio, EstadoResenia.PUBLICADA);

        Map<Integer, Long> desglose = new LinkedHashMap<>();
        for (int i = 5; i >= 1; i--) {
            long count = reseniaRepository.countByTipoItemAndIdMicroservicioAndCalificacionAndEstado(
                    tipoItem, idMicroservicio, i, EstadoResenia.PUBLICADA
            );
            desglose.put(i, count);
        }

        List<Resenia> publicadas = reseniaRepository
                .findByTipoItemAndIdMicroservicioAndEstadoOrderByFechaCreacionDesc(tipoItem, idMicroservicio, EstadoResenia.PUBLICADA);

        long felicitaciones = publicadas.stream().filter(r -> r.getCategoria() == CategoriaResenia.FELICITACION).count();
        long mejoras = publicadas.stream().filter(r -> r.getCategoria() == CategoriaResenia.MEJORA).count();
        long criticas = publicadas.stream().filter(r -> r.getCategoria() == CategoriaResenia.CRITICA).count();

        Double promedioRedondeado = promedio != null ? Math.round(promedio * 10.0) / 10.0 : 0.0;

        return new ResumenCalificacionesDTO(
                promedioRedondeado,
                total,
                felicitaciones,
                mejoras,
                criticas,
                desglose
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReseniaResponseDTO> listarParaAuditoria(EstadoResenia estadoFiltro, CategoriaResenia categoriaFiltro) {
        List<Resenia> resultado;
        if (categoriaFiltro != null && estadoFiltro != null) {
            resultado = reseniaRepository.findByCategoriaAndEstadoOrderByFechaCreacionDesc(categoriaFiltro, estadoFiltro);
        } else if (estadoFiltro != null) {
            resultado = reseniaRepository.findByEstadoOrderByFechaCreacionDesc(estadoFiltro);
        } else {
            resultado = reseniaRepository.findAllByOrderByFechaCreacionDesc();
        }

        return resultado.stream().map(ReseniaResponseDTO::fromEntity).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ResumenCalificacionesDTO obtenerMetricasGenerales() {
        Double promedio = reseniaRepository.calcularPromedioCalificacionGeneral(EstadoResenia.PUBLICADA);
        long total = reseniaRepository.count();

        long felicitaciones = reseniaRepository.countByCategoria(CategoriaResenia.FELICITACION);
        long mejoras = reseniaRepository.countByCategoria(CategoriaResenia.MEJORA);
        long criticas = reseniaRepository.countByCategoria(CategoriaResenia.CRITICA);

        Map<Integer, Long> desglose = new LinkedHashMap<>();
        for (int i = 5; i >= 1; i--) {
            long count = reseniaRepository.countByCalificacion(i);
            desglose.put(i, count);
        }

        Double promedioRedondeado = promedio != null ? Math.round(promedio * 10.0) / 10.0 : 0.0;

        return new ResumenCalificacionesDTO(
                promedioRedondeado,
                total,
                felicitaciones,
                mejoras,
                criticas,
                desglose
        );
    }

    @Override
    public ReseniaResponseDTO registrarAccionMejora(Long idResenia, RegistrarAccionMejoraDTO dto, String usuarioAdmin) {
        Resenia resenia = reseniaRepository.findById(idResenia)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reseña no encontrada"));

        String usuario = dto.usuarioAccionMejora() != null && !dto.usuarioAccionMejora().isBlank()
                ? dto.usuarioAccionMejora()
                : (usuarioAdmin != null ? usuarioAdmin : "Jefatura de Operaciones");

        resenia.registrarMejoraOperacional(dto.planAccionMejora(), usuario);
        return ReseniaResponseDTO.fromEntity(resenia);
    }

    @Override
    public ReseniaResponseDTO cambiarEstado(Long idResenia, EstadoResenia nuevoEstado) {
        Resenia resenia = reseniaRepository.findById(idResenia)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reseña no encontrada"));

        resenia.setEstado(nuevoEstado);
        return ReseniaResponseDTO.fromEntity(resenia);
    }

    @Override
    public void eliminar(Long idResenia) {
        if (!reseniaRepository.existsById(idResenia)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Reseña no encontrada");
        }
        reseniaRepository.deleteById(idResenia);
    }
}

