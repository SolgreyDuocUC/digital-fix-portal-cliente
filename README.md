# DigitalFix · Portal de Clientes

Tienda y seguimiento de órdenes para clientes, más las vistas del equipo comercial (vendedor, marketing y jefe de ventas).

- `frontend/`: React + Vite.
- `backend/`: Spring Boot. Maneja la identidad y el JWT propios del portal, y consume ms-catalog y ms-workorders del ERP.

## Con Docker

1. Copia la plantilla de variables y complétala:

   ```bash
   cp .env.example .env
   ```

   Completa `PORTAL_DB_PASSWORD` y `PORTAL_JWT_SECRET` (genéralo con `openssl rand -hex 32`). Completa también `PORTAL_API_KEY`, que debe ser igual a la de ms-workorders.
2. Levanta primero `digitalfix-infrastructure`. Crea la red `digitalfix-net`, donde viven `ms-catalog-service` y `ms-workorders-service`.
3. Levanta el portal:

   ```bash
   docker compose up -d --build
   ```

4. Abre el portal en <http://localhost:3000>. El Swagger del backend está en <http://localhost:8091/swagger-ui.html> (solo desde el propio equipo).

| Contenedor | Qué hace |
| --- | --- |
| `portal-frontend` | nginx sirve la app y reenvía `/api/v1` al backend. |
| `portal-backend` | Spring Boot en el puerto 8090, dentro de las redes `digitalfix-portal-net` y `digitalfix-net`. |
| `digitalfix-portal-db` | PostgreSQL 16 con la base `portal_db`. Los datos persisten en el volumen `digitalfix-portal-db-data`. |

Con `PORTAL_DATOS_DEMO=true` se crean cuentas de prueba para cada rol; el login las muestra. Si el ERP no está levantado, la tienda muestra un aviso de catálogo no disponible, pero el login y la cuenta funcionan.

## En desarrollo

- **Backend:** `cd backend` y luego `./mvnw spring-boot:run`. Lee `backend/.env` (ver `backend/.env.example`) y usa H2 en `backend/data/` si no se define otra base.
- **Frontend:** `cd frontend`, luego `npm install` y `npm run dev`. Abre <http://localhost:5173>; Vite reenvía `/api/v1` al backend en el puerto 8090.
