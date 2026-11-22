package df.portal.cl.controller;

import df.portal.cl.model.usuarios.RolUsuario;
import df.portal.cl.model.usuarios.Usuario;
import df.portal.cl.remote.catalogo.CatalogoClient;
import df.portal.cl.remote.catalogo.CatalogoDtos.ProductoCatalogo;
import df.portal.cl.remote.catalogo.CatalogoDtos.VerifyAndHoldResponse;
import df.portal.cl.remote.ordenes.OrdenesDtos.SeguimientoOrden;
import df.portal.cl.remote.ordenes.OrdenesDtos.ServicioRemoto;
import df.portal.cl.remote.ordenes.OrdenesTrabajoClient;
import df.portal.cl.repository.CuponRepository;
import df.portal.cl.repository.PedidoRepository;
import df.portal.cl.repository.ProductoTiendaRepository;
import df.portal.cl.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * API del portal con la seguridad real y la base H2 en memoria. Solo se simulan los microservicios
 * (CatalogoClient y OrdenesTrabajoClient), así se prueba todo lo que es responsabilidad del portal.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class PortalApiIntegracionTest {

    private static final Pattern ACCESS_TOKEN = Pattern.compile("\"accessToken\"\\s*:\\s*\"([^\"]+)\"");

    @Autowired MockMvc mockMvc;
    @Autowired UsuarioRepository usuarioRepository;
    @Autowired PedidoRepository pedidoRepository;
    @Autowired ProductoTiendaRepository productoTiendaRepository;
    @Autowired CuponRepository cuponRepository;
    @Autowired PasswordEncoder passwordEncoder;

    @MockitoBean CatalogoClient catalogoClient;
    @MockitoBean OrdenesTrabajoClient ordenesTrabajoClient;

    @BeforeEach
    void limpiar() {
        pedidoRepository.deleteAll();
        usuarioRepository.deleteAll();
        productoTiendaRepository.deleteAll();
        cuponRepository.deleteAll();
        var interruptor = new ProductoCatalogo(7L, "REP-0007", "Interruptor termomagnético 2x16A", "Curva C",
                "Protecciones Eléctricas", new BigDecimal("8990"), 12, true, "UNIDAD", true, "Schneider");
        when(catalogoClient.listarProductos()).thenReturn(List.of(interruptor));
        when(catalogoClient.obtenerProducto(7L)).thenReturn(interruptor);
        when(ordenesTrabajoClient.listarServicios()).thenReturn(List.of(
                new ServicioRemoto(3L, "SRV-0003", "Revisión de tablero eléctrico", "Diagnóstico", new BigDecimal("45000"))));
    }

    @Test
    void catalogoEsPublicoYCombinaRepuestosYServiciosDelErp() throws Exception {
        mockMvc.perform(get("/api/v1/products"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].codigo").value("REP-0007"))
                .andExpect(jsonPath("$[0].precio").value(8990))
                .andExpect(jsonPath("$[0].stock").value(12))
                .andExpect(jsonPath("$[0].disponible").value(true));
        mockMvc.perform(get("/api/v1/products/services"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].tipo").value("SERVICIO"))
                .andExpect(jsonPath("$[0].precio").value(45000));
    }

    @Test
    void registroLoginYPerfil() throws Exception {
        mockMvc.perform(post("/api/v1/auth/register").contentType(MediaType.APPLICATION_JSON).content("""
                        {"rut":"12345678-5","nombre":"Juan","apellidos":"Pérez","email":"Juan@Correo.cl",
                         "telefono":"9 1234 5678","password":"Secreta123"}"""))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.usuario.rut").value("12.345.678-5"))
                .andExpect(jsonPath("$.usuario.telefono").value("+56912345678"))
                .andExpect(jsonPath("$.roles[0]").value("CLIENTE"));

        // RUT inválido → 400 con el detalle del campo
        mockMvc.perform(post("/api/v1/auth/register").contentType(MediaType.APPLICATION_JSON).content("""
                        {"rut":"12345678-9","nombre":"X","email":"x@correo.cl","telefono":"912345678","password":"Secreta123"}"""))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors[0]").value(org.hamcrest.Matchers.startsWith("rut:")));

        String token = login("juan@correo.cl", "Secreta123");
        mockMvc.perform(get("/api/v1/users/me").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("juan@correo.cl"));

        mockMvc.perform(post("/api/v1/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"juan@correo.cl\",\"password\":\"otra-clave\"}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Correo o contraseña incorrectos"));
    }

    @Test
    void permisosPorRol() throws Exception {
        mockMvc.perform(get("/api/v1/orders/my-orders")).andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401));
        mockMvc.perform(get("/api/v1/users/me").header("Authorization", "Bearer token-falso"))
                .andExpect(status().isUnauthorized());

        crearUsuario("cliente@correo.cl", RolUsuario.ROLE_CLIENTE, "76.543.210-3");
        crearUsuario("mkt@correo.cl", RolUsuario.ROLE_MARKETING, null);
        String cliente = login("cliente@correo.cl", "Clave12345");
        String marketing = login("mkt@correo.cl", "Clave12345");

        // El cliente no gestiona la tienda ni los cupones; Marketing no compra.
        mockMvc.perform(get("/api/v1/products/tienda").header("Authorization", "Bearer " + cliente))
                .andExpect(status().isForbidden());
        mockMvc.perform(get("/api/v1/promo-codes").header("Authorization", "Bearer " + cliente))
                .andExpect(status().isForbidden());
        mockMvc.perform(get("/api/v1/orders/my-orders").header("Authorization", "Bearer " + marketing))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/v1/products/tienda").header("Authorization", "Bearer " + marketing))
                .andExpect(status().isOk());
    }

    @Test
    void marketingOcultaUnRepuestoYDejaDeVenderse() throws Exception {
        crearUsuario("mkt@correo.cl", RolUsuario.ROLE_MARKETING, null);
        String marketing = login("mkt@correo.cl", "Clave12345");

        mockMvc.perform(put("/api/v1/products/tienda/REPUESTO/7").header("Authorization", "Bearer " + marketing)
                        .contentType(MediaType.APPLICATION_JSON).content("""
                        {"imagenDriveUrl":"https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OIvE2e104/view",
                         "badgePromocional":"OFERTA","descuentoPorcentaje":10,"visibleEnTienda":false}"""))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.precioFinal").value(8091))
                .andExpect(jsonPath("$.imagenDirectaUrl").value(org.hamcrest.Matchers.startsWith("https://lh3.googleusercontent.com/d/")));

        mockMvc.perform(get("/api/v1/products")).andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void checkoutCreaLaOtYQuedaEnMisPedidos() throws Exception {
        Usuario usuario = crearUsuario("cliente@correo.cl", RolUsuario.ROLE_CLIENTE, "76.543.210-3");
        String token = login("cliente@correo.cl", "Clave12345");

        when(catalogoClient.verificarYReservar(any())).thenReturn(
                new VerifyAndHoldResponse(true, true, "HOLD-1", Instant.now().plusSeconds(1800), "OK", List.of()));
        SeguimientoOrden ot = new SeguimientoOrden(900L, "OT-900", "CREADA", "Orden creada", LocalDateTime.now(),
                LocalDateTime.now(), null, null, List.of(new SeguimientoOrden.Hito("CREADA", "Orden creada", "", true, true)),
                List.of(), new BigDecimal("45000"));
        when(ordenesTrabajoClient.crearOrden(any())).thenReturn(ot);
        when(ordenesTrabajoClient.ordenesDelCliente("76.543.210-3")).thenReturn(List.of(ot));

        mockMvc.perform(post("/api/v1/orders").header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON).content("""
                        {"items":[{"tipo":"REPUESTO","id":7,"cantidad":2},{"tipo":"SERVICIO","id":3,"cantidad":1}],
                         "direccion":{"calle":"Av. Providencia","numero":"1234","idComuna":13123},
                         "horarioPreferido":"Lunes AM"}"""))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.codigoSeguimiento").value("OT-900"))
                .andExpect(jsonPath("$.total").value(62980))
                .andExpect(jsonPath("$.items.length()").value(2));

        mockMvc.perform(get("/api/v1/orders/my-orders").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].origen").value("PORTAL"))
                .andExpect(jsonPath("$[0].seguimientoEnVivo").value(true));

        assertThat(pedidoRepository.findByUsuario_IdUsuarioOrderByFechaCreacionDesc(usuario.getIdUsuario()))
                .singleElement().satisfies(p -> assertThat(p.getIdOrdenTrabajo()).isEqualTo(900L));
    }

    // ---------------------------------------------------------------------

    private Usuario crearUsuario(String email, RolUsuario rol, String rut) {
        return usuarioRepository.save(Usuario.builder().email(email).password(passwordEncoder.encode("Clave12345"))
                .nombre("Prueba").rol(rol).rut(rut).telefono("+56912345678").activo(true).build());
    }

    private String login(String email, String password) throws Exception {
        MvcResult r = mockMvc.perform(post("/api/v1/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"" + email + "\",\"password\":\"" + password + "\"}"))
                .andExpect(status().isOk())
                .andReturn();
        Matcher m = ACCESS_TOKEN.matcher(r.getResponse().getContentAsString());
        assertThat(m.find()).isTrue();
        return m.group(1);
    }
}
