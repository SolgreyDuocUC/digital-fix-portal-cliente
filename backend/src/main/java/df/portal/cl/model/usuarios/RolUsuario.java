package df.portal.cl.model.usuarios;

/**
 * Roles autorizados en el Portal Cliente / Comercial de DigitalFix.
 * Identidad desacoplada del Azure Entra ID del ERP. El nombre del enum es la authority
 * de Spring Security (hasRole("CLIENTE") ⇔ ROLE_CLIENTE).
 */
public enum RolUsuario {
    ROLE_CLIENTE,
    ROLE_VENDEDOR,
    ROLE_MARKETING,
    ROLE_JEFE_VENTAS;

    /** Nombre sin prefijo ("CLIENTE"), para mostrar y para el frontend. */
    public String sinPrefijo() {
        return name().substring("ROLE_".length());
    }
}
