package df.portal.cl.security;

import df.portal.cl.model.usuarios.RolUsuario;

/**
 * Principal de cada petición autenticada (sale del access token). Los controladores lo reciben con
 * {@code @AuthenticationPrincipal UsuarioAutenticado usuario}: el usuario se toma del token, nunca
 * de un parámetro como el "?userId=" del ejemplo One Tech, que permitía actuar en nombre de otro.
 */
public record UsuarioAutenticado(Long id, String email, String nombre, RolUsuario rol) {
}
