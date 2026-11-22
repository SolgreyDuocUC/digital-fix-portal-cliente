# ==========================================
# Backend del Portal Cliente DigitalFix
# ==========================================
# Etapa 1: Build / Compilación
# ==========================================
FROM maven:3.9.8-eclipse-temurin-21-alpine AS builder

WORKDIR /app

# Copiar pom.xml primero para aprovechar la caché de capas de Docker
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copiar el código fuente y compilar
COPY src ./src
RUN mvn package -DskipTests -B

# ==========================================
# Etapa 2: Imagen Final de Ejecución
# ==========================================
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Usuario no-root por seguridad; /app/data queda escribible por si se usa H2 en archivo.
RUN addgroup -S spring && adduser -S spring -G spring \
    && mkdir -p /app/data && chown spring:spring /app/data
USER spring:spring

COPY --from=builder /app/target/*.jar app.jar

EXPOSE 8090

ENV JAVA_OPTS=""

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
