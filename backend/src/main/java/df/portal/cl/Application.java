package df.portal.cl;

import java.nio.file.Files;
import java.nio.file.Path;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.boot.system.ApplicationHome;

@SpringBootApplication
@ConfigurationPropertiesScan
public class Application {

	/** Propiedad que usa application.yaml para ubicar el .env del portal. */
	static final String DIR_ENV = "portal.dir-env";

	public static void main(String[] args) {
		ubicarEnvDelPortal();
		SpringApplication.run(Application.class, args);
	}

	/**
	 * El .env se carga relativo a la carpeta de trabajo. Si el IDE lanza la app desde la raíz de
	 * DigitalFix, se leería el .env general del ERP (Oracle, puertos y URLs de Docker) en vez del
	 * del portal. Por eso se fija la carpeta del backend (la que tiene el pom.xml, subiendo desde
	 * target/classes o desde el jar). En Docker no hay pom.xml y se mantiene la carpeta de trabajo.
	 */
	private static void ubicarEnvDelPortal() {
		if (System.getProperty(DIR_ENV) != null) {
			return;
		}
		try {
			// ApplicationHome resuelve tanto target/classes (IDE) como la carpeta del jar.
			Path dir = new ApplicationHome(Application.class).getDir().toPath();
			for (int i = 0; i < 4 && dir != null; i++, dir = dir.getParent()) {
				if (Files.isRegularFile(dir.resolve("pom.xml"))) {
					System.setProperty(DIR_ENV, dir.toString());
					return;
				}
			}
		} catch (Exception ignorada) {
			// Sin ubicación conocida: se usa la carpeta de trabajo, como antes.
		}
	}
}
