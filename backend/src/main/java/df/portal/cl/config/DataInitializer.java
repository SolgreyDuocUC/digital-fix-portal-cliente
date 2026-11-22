package df.portal.cl.config;

import df.portal.cl.model.cupones.Cupon;
import df.portal.cl.model.cupones.TipoDescuento;
import df.portal.cl.model.usuarios.RolUsuario;
import df.portal.cl.model.usuarios.Usuario;
import df.portal.cl.repository.CuponRepository;
import df.portal.cl.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Datos demo para desarrollo y presentaciones (PORTAL_DATOS_DEMO=true). Solo crea lo que no exista,
 * así que puede quedar activo entre reinicios. No hay datos de catálogo: los productos y servicios
 * siempre vienen de ms-catalog y ms-workorders.
 *
 *   cliente@digitalfix.cl    / Cliente123!    (Comercial Rojas SpA, RUT 76.543.210-3)
 *   marketing@digitalfix.cl  / Marketing123!
 *   vendedor@digitalfix.cl   / Vendedor123!
 *   jefe@digitalfix.cl       / JefeVentas123!
 *   Cupón BIENVENIDA10 (10 %, vigente 1 año)
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final PortalProperties props;
    private final UsuarioRepository usuarioRepository;
    private final CuponRepository cuponRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        if (!props.datosDemo()) {
            return;
        }
        crearUsuario("cliente@digitalfix.cl", "Cliente123!", RolUsuario.ROLE_CLIENTE,
                "Andrea", "Rojas Muñoz", "76.543.210-3", "Comercial Rojas SpA", "+56987654321");
        crearUsuario("marketing@digitalfix.cl", "Marketing123!", RolUsuario.ROLE_MARKETING,
                "Equipo", "Marketing", null, null, null);
        crearUsuario("vendedor@digitalfix.cl", "Vendedor123!", RolUsuario.ROLE_VENDEDOR,
                "Equipo", "Comercial", null, null, null);
        crearUsuario("jefe@digitalfix.cl", "JefeVentas123!", RolUsuario.ROLE_JEFE_VENTAS,
                "Jefatura", "de Ventas", null, null, null);

        if (!cuponRepository.existsByCodigoIgnoreCase("BIENVENIDA10")) {
            cuponRepository.save(Cupon.builder()
                    .codigo("BIENVENIDA10")
                    .descripcion("10 % en tu primer servicio")
                    .tipo(TipoDescuento.PORCENTAJE)
                    .valor(BigDecimal.TEN)
                    .fechaInicio(LocalDate.now())
                    .fechaFin(LocalDate.now().plusYears(1))
                    .activo(true)
                    .build());
            log.info("Datos demo: cupón BIENVENIDA10 creado");
        }
    }

    private void crearUsuario(String email, String password, RolUsuario rol, String nombre, String apellidos,
                              String rut, String razonSocial, String telefono) {
        if (usuarioRepository.existsByEmailIgnoreCase(email)) {
            return;
        }
        usuarioRepository.save(Usuario.builder()
                .email(email)
                .password(passwordEncoder.encode(password))
                .rol(rol)
                .nombre(nombre)
                .apellidos(apellidos)
                .rut(rut)
                .razonSocial(razonSocial)
                .telefono(telefono)
                .activo(true)
                .build());
        log.info("Datos demo: usuario {} ({}) creado", email, rol.sinPrefijo());
    }
}
