package df.portal.cl.services.Promo;

import df.portal.cl.dto.Promo.CuponDTO;
import df.portal.cl.dto.Promo.CuponRequest;
import df.portal.cl.dto.Promo.ValidacionCuponDTO;
import df.portal.cl.exceptions.NegocioException;
import df.portal.cl.model.cupones.Cupon;
import df.portal.cl.model.cupones.TipoDescuento;
import df.portal.cl.repository.CuponRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
@Transactional
public class PromoServiceImpl implements PromoService {

    private final CuponRepository cuponRepository;

    @Override
    @Transactional(readOnly = true)
    public ValidacionCuponDTO validar(String codigo, BigDecimal subtotal) {
        BigDecimal base = subtotal == null ? BigDecimal.ZERO : subtotal.max(BigDecimal.ZERO);
        String normalizado = normalizar(codigo);
        return cuponRepository.findByCodigoIgnoreCase(normalizado)
                .map(cupon -> {
                    String motivo = cupon.motivoNoAplicable(base, LocalDate.now());
                    if (motivo != null) {
                        return new ValidacionCuponDTO(cupon.getCodigo(), false, motivo, BigDecimal.ZERO, base);
                    }
                    BigDecimal descuento = cupon.calcularDescuento(base);
                    return new ValidacionCuponDTO(cupon.getCodigo(), true, "Cupón aplicado", descuento, base.subtract(descuento));
                })
                .orElseGet(() -> new ValidacionCuponDTO(normalizado, false,
                        "El cupón " + normalizado + " no existe", BigDecimal.ZERO, base));
    }

    @Override
    @Transactional(readOnly = true)
    public Cupon obtenerAplicable(String codigo, BigDecimal subtotal) {
        String normalizado = normalizar(codigo);
        Cupon cupon = cuponRepository.findByCodigoIgnoreCase(normalizado)
                .orElseThrow(() -> NegocioException.invalido("El cupón " + normalizado + " no existe"));
        String motivo = cupon.motivoNoAplicable(subtotal, LocalDate.now());
        if (motivo != null) {
            throw NegocioException.invalido(motivo);
        }
        return cupon;
    }

    @Override
    @Transactional(readOnly = true)
    public List<CuponDTO> listar() {
        return cuponRepository.findAllByOrderByFechaFinDesc().stream().map(CuponDTO::from).toList();
    }

    @Override
    public CuponDTO crear(CuponRequest request) {
        String codigo = normalizar(request.codigo());
        if (cuponRepository.existsByCodigoIgnoreCase(codigo)) {
            throw NegocioException.conflicto("Ya existe el cupón " + codigo);
        }
        Cupon cupon = Cupon.builder().codigo(codigo).usosActuales(0).build();
        aplicar(cupon, request);
        return CuponDTO.from(cuponRepository.save(cupon));
    }

    @Override
    public CuponDTO actualizar(Long id, CuponRequest request) {
        Cupon cupon = obtener(id);
        String codigo = normalizar(request.codigo());
        if (!cupon.getCodigo().equalsIgnoreCase(codigo)) {
            if (cupon.getUsosActuales() > 0) {
                throw NegocioException.invalido("No se puede cambiar el código de un cupón que ya se usó");
            }
            if (cuponRepository.existsByCodigoIgnoreCase(codigo)) {
                throw NegocioException.conflicto("Ya existe el cupón " + codigo);
            }
            cupon.setCodigo(codigo);
        }
        aplicar(cupon, request);
        return CuponDTO.from(cupon);
    }

    @Override
    public void desactivar(Long id) {
        obtener(id).setActivo(false);
    }

    private Cupon obtener(Long id) {
        return cuponRepository.findById(id)
                .orElseThrow(() -> NegocioException.noEncontrado("No existe el cupón " + id));
    }

    private static void aplicar(Cupon cupon, CuponRequest request) {
        if (request.fechaFin().isBefore(request.fechaInicio())) {
            throw NegocioException.invalido("La fecha de término no puede ser anterior a la de inicio");
        }
        if (request.tipo() == TipoDescuento.PORCENTAJE && request.valor().compareTo(BigDecimal.valueOf(100)) > 0) {
            throw NegocioException.invalido("Un descuento porcentual no puede superar el 100 %");
        }
        cupon.setDescripcion(request.descripcion());
        cupon.setTipo(request.tipo());
        cupon.setValor(request.valor());
        cupon.setMontoMinimo(request.montoMinimo());
        cupon.setFechaInicio(request.fechaInicio());
        cupon.setFechaFin(request.fechaFin());
        cupon.setUsosMaximos(request.usosMaximos());
        cupon.setActivo(request.activo() == null || request.activo());
    }

    private static String normalizar(String codigo) {
        if (codigo == null || codigo.isBlank()) {
            throw NegocioException.invalido("Indica el código del cupón");
        }
        return codigo.strip().toUpperCase(Locale.ROOT);
    }
}
