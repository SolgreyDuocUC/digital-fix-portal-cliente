package df.portal.cl.dto.Promo;

import df.portal.cl.model.cupones.Cupon;
import df.portal.cl.model.cupones.TipoDescuento;

import java.math.BigDecimal;
import java.time.LocalDate;

public record CuponDTO(
        Long id,
        String codigo,
        String descripcion,
        TipoDescuento tipo,
        BigDecimal valor,
        BigDecimal montoMinimo,
        LocalDate fechaInicio,
        LocalDate fechaFin,
        Integer usosMaximos,
        int usosActuales,
        boolean activo,
        boolean vigenteHoy
) {
    public static CuponDTO from(Cupon c) {
        return new CuponDTO(c.getIdCupon(), c.getCodigo(), c.getDescripcion(), c.getTipo(), c.getValor(),
                c.getMontoMinimo(), c.getFechaInicio(), c.getFechaFin(), c.getUsosMaximos(), c.getUsosActuales(),
                c.isActivo(), c.motivoNoAplicable(BigDecimal.valueOf(Long.MAX_VALUE), LocalDate.now()) == null);
    }
}
