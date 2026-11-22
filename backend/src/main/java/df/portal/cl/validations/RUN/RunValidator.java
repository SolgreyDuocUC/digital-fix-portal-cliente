package df.portal.cl.validations.RUN;

import df.portal.cl.util.RutUtil;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

/** Valor nulo = válido (la obligatoriedad se declara con @NotBlank). */
public class RunValidator implements ConstraintValidator<ValidRun, String> {

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        return value == null || value.isBlank() || RutUtil.esValido(value);
    }
}
