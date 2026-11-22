package df.portal.cl.validations.RUN;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/** RUN/RUT chileno con dígito verificador válido ("12.345.678-5", "12345678-5" o "123456785"). */
@Target({ElementType.FIELD, ElementType.PARAMETER, ElementType.RECORD_COMPONENT})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = RunValidator.class)
public @interface ValidRun {
    String message() default "RUT inválido: revisa el número y el dígito verificador";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
