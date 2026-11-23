# DigitalFix · Portal de Clientes

Tienda y seguimiento de órdenes para clientes, más las vistas del equipo comercial (vendedor, marketing y jefe de ventas).

- `frontend/`: React + Vite.
- `backend/`: Spring Boot. Maneja la identidad y el JWT propios del portal, y consume ms-catalog y ms-workorders del ERP.

## Con Docker

El portal es un stack independiente: trae su propia base de datos (PostgreSQL) y arranca aunque el ERP no esté levantado. Consume ms-catalog y ms-workorders por HTTP en las URLs que definas.

1. Copia la plantilla de variables y complétala:

   ```bash
   cp .env.example .env
   ```

   Completa `PORTAL_DB_PASSWORD` y `PORTAL_JWT_SECRET` (genéralo con `openssl rand -hex 32`). Completa también `PORTAL_API_KEY`, que debe ser igual a `PORTAL_API_KEY` en el `.env` de `digitalfix-infrastructure` (la lee ms-workorders).
2. Levanta el portal según dónde esté el ERP:

   | El ERP está... | Comando | `MS_CATALOG_URL` / `MS_WORKORDERS_URL` |
   | --- | --- | --- |
   | En tu equipo, fuera de Docker (IDE) | `docker compose up -d --build` | `http://host.docker.internal:8088` / `:8085` (valor por defecto) |
   | En otro servidor | `docker compose up -d --build` | `http://<ip-o-dominio>:<puerto>` |
   | En este mismo Docker (`digitalfix-infrastructure`) | `docker compose -f docker-compose.yml -f docker-compose.erp.yml up -d --build` | Las fija `docker-compose.erp.yml` |

3. Abre el portal en <http://localhost:3000>. El Swagger del backend está en <http://localhost:8091/swagger-ui.html> (solo desde el propio equipo) y el estado en <http://localhost:8091/actuator/health>.

| Contenedor | Qué hace |
| --- | --- |
| `portal-frontend` | nginx sirve la app y reenvía `/api/v1` al backend. |
| `portal-backend` | Spring Boot en el puerto 8090. Llama a ms-catalog y ms-workorders. |
| `digitalfix-portal-db` | PostgreSQL 16 con la base `portal_db`. Los datos persisten en el volumen `digitalfix-portal-db-data`. |

Con `PORTAL_DATOS_DEMO=true` se crean cuentas de prueba para cada rol; el login las muestra. Si el ERP no responde, la tienda y "Mis órdenes" muestran un aviso, pero el login y la cuenta funcionan.

## En desarrollo

- **Backend:** `cd backend` y luego `./mvnw spring-boot:run`. Lee `backend/.env` (ver `backend/.env.example`) y usa H2 en `backend/data/` si no se define otra base.
- **Frontend:** `cd frontend`, luego `npm install` y `npm run dev`. Abre <http://localhost:5173>; Vite reenvía `/api/v1` al backend en el puerto 8090.
