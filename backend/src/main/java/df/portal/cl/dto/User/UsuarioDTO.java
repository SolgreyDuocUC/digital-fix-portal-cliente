package df.portal.cl.dto.User;

import df.portal.cl.model.usuarios.Usuario;

public record UsuarioDTO(
        Long id,
        String rut,
        String nombre,
        String apellidos,
        String nombreCompleto,
        String razonSocial,
        String email,
        String telefono,
        String direccion,
        Long idComuna,
        String comuna,
        String region,
        String rol
) {
    public static UsuarioDTO from(Usuario u) {
        return new UsuarioDTO(u.getIdUsuario(), u.getRut(), u.getNombre(), u.getApellidos(), u.getNombreCompleto(),
                u.getRazonSocial(), u.getEmail(), u.getTelefono(), u.getDireccion(), u.getIdComuna(),
                u.getComuna(), u.getRegion(), u.getRol().sinPrefijo());
    }
}
