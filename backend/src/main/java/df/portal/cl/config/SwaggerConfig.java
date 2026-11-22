package df.portal.cl.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    private static final String BEARER = "bearerAuth";

    @Bean
    public OpenAPI customOpenAPI() {
        Contact contact = new Contact();
        contact.setName("Equipo DigitalFix");

        return new OpenAPI()
                .info(new Info()
                        .title("DigitalFix · Portal Cliente")
                        .version("0.1.0")
                        .description("""
                                Backend monolítico del Portal Cliente. Maneja la identidad local (JWT propio),
                                la capa comercial de la tienda, los cupones y los pedidos. El catálogo y el stock
                                vienen de ms-catalog y cada pedido se convierte en una Orden de Trabajo en
                                ms-workorders, visible en el portal de empleados.
                                Para probar endpoints protegidos: POST /api/v1/auth/login y usar el token en "Authorize".""")
                        .contact(contact))
                .components(new Components().addSecuritySchemes(BEARER, new SecurityScheme()
                        .type(SecurityScheme.Type.HTTP).scheme("bearer").bearerFormat("JWT")))
                .addSecurityItem(new SecurityRequirement().addList(BEARER));
    }
}
