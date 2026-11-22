package df.portal.cl.util;

import java.util.Locale;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Validación y formato de RUT chileno (módulo 11), con las mismas reglas que ms-workorders:
 * acepta "12.345.678-5", "12345678-5" o "123456785" y siempre entrega "12.345.678-5".
 */
public final class RutUtil {

    private static final Pattern FORMATO = Pattern.compile("^(\\d{1,2}(?:\\.?\\d{3}){2})-?([\\dK])$");
    private static final int NUMERO_MINIMO = 1_000_000;
    private static final int NUMERO_MAXIMO = 99_999_999;

    private RutUtil() {
    }

    public static boolean esValido(String rut) {
        try {
            normalizar(rut);
            return true;
        } catch (IllegalArgumentException ex) {
            return false;
        }
    }

    /** @return el RUT con puntos y guion ("12.345.678-5"). */
    public static String normalizar(String rut) {
        if (rut == null || rut.isBlank()) {
            throw new IllegalArgumentException("El RUT es obligatorio");
        }
        String limpio = rut.strip().toUpperCase(Locale.ROOT).replace(" ", "");
        if (limpio.length() > 14) {
            throw new IllegalArgumentException("Formato de RUT inválido");
        }
        Matcher m = FORMATO.matcher(limpio);
        if (!m.matches()) {
            throw new IllegalArgumentException("Formato de RUT inválido");
        }
        int numero = Integer.parseInt(m.group(1).replace(".", ""));
        if (numero < NUMERO_MINIMO || numero > NUMERO_MAXIMO) {
            throw new IllegalArgumentException("El número de RUT está fuera de rango");
        }
        char dv = m.group(2).charAt(0);
        if (calcularDv(numero) != dv) {
            throw new IllegalArgumentException("El dígito verificador del RUT no es válido");
        }
        return formatear(numero, dv);
    }

    static char calcularDv(int numero) {
        int suma = 0;
        int factor = 2;
        for (int n = numero; n > 0; n /= 10) {
            suma += (n % 10) * factor;
            factor = factor == 7 ? 2 : factor + 1;
        }
        int resto = 11 - (suma % 11);
        return resto == 11 ? '0' : resto == 10 ? 'K' : (char) ('0' + resto);
    }

    private static String formatear(int numero, char dv) {
        return String.format(Locale.ROOT, "%,d", numero).replace(',', '.') + "-" + dv;
    }
}
