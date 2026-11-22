package df.portal.cl.util;

import java.util.regex.Pattern;

/**
 * Teléfono chileno en el formato que exige ms-workorders ("+56" + 9 dígitos), para que el cliente
 * que se crea en el ERP con el primer pedido nunca sea rechazado por formato.
 */
public final class TelefonoUtil {

    private static final Pattern SEPARADORES = Pattern.compile("[\\s().-]");
    private static final Pattern NUEVE_DIGITOS = Pattern.compile("\\d{9}");
    private static final Pattern CON_PREFIJO = Pattern.compile("\\+?56\\d{9}");

    private TelefonoUtil() {
    }

    /** @return "+56XXXXXXXXX" */
    public static String normalizar(String telefono) {
        if (telefono == null || telefono.isBlank()) {
            throw new IllegalArgumentException("El teléfono es obligatorio");
        }
        String digitos = SEPARADORES.matcher(telefono.strip()).replaceAll("");
        if (NUEVE_DIGITOS.matcher(digitos).matches()) {
            return "+56" + digitos;
        }
        if (CON_PREFIJO.matcher(digitos).matches()) {
            return digitos.startsWith("+") ? digitos : "+" + digitos;
        }
        throw new IllegalArgumentException("El teléfono debe tener 9 dígitos, ej. +56 9 1234 5678");
    }
}
