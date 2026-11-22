# 🚀 Guía de Despliegue — Portal Cliente DigitalFix
> **Rama `deploy`**: Contabo VPS + Portainer (Docker Compose Stack)  
> **Rama `main`**: Amazon (ECS / EC2 / App Runner)

---

## Requisitos previos en el VPS Contabo

| Componente | Versión mínima |
|---|---|
| Docker Engine | 24.x |
| Docker Compose plugin | 2.x (`docker compose` sin guion) |
| Portainer CE | 2.19+ |
| RAM recomendada | ≥ 2 GB |
| Puerto 3000 (o 80) | Abierto en firewall |

---

## 1. Preparar secretos en el VPS

```bash
# Genera contraseña DB y secreto JWT
openssl rand -hex 24   # → PORTAL_DB_PASSWORD
openssl rand -hex 32   # → PORTAL_JWT_SECRET
```

---

## 2. Levantar la red del ERP (si ya corre digitalfix-infrastructure)

```bash
# Si digitalfix-infrastructure ya está corriendo, la red ya existe. Verificar:
docker network ls | grep digitalfix-net

# Si NO existe (prueba aislada del portal):
docker network create digitalfix-net
```

---

## 3. Despliegue con Portainer (método recomendado)

### Opción A — Stack desde repositorio Git (CI/CD automático)

1. En Portainer → **Stacks → Add Stack → Repository**
2. URL: `https://github.com/SolgreyDuocUC/digital-fix-portal-cliente.git`
3. Branch: **`deploy`**
4. Compose file: `docker-compose.yml`
5. En **Environment variables** (o archivo `.env` cargado), completar:

| Variable | Descripción | Ejemplo |
|---|---|---|
| `PORTAL_DB_PASSWORD` | Contraseña PostgreSQL | `s3cr3t!` |
| `PORTAL_JWT_SECRET` | Secreto JWT ≥ 32 chars | `openssl rand -hex 32` |
| `PORTAL_API_KEY` | API key de ms-workorders | (ver ERP) |
| `PORTAL_DATOS_DEMO` | Cargar datos demo | `true` |
| `PORTAL_FRONTEND_PORT` | Puerto público del portal | `3000` |
| `PORTAL_BACKEND_PORT` | Puerto Swagger (localhost) | `8091` |
| `MS_CATALOG_URL` | URL interna del catálogo | `http://ms-catalog-service:8080` |
| `MS_WORKORDERS_URL` | URL interna de órdenes | `http://ms-workorders-service:8080` |

6. Click **Deploy the stack** → Portainer hará `docker compose up -d --build`

### Opción B — CLI directo en el VPS

```bash
# Clonar rama deploy
git clone -b deploy https://github.com/SolgreyDuocUC/digital-fix-portal-cliente.git portal-cliente
cd portal-cliente

# Configurar secretos
cp .env.example .env
nano .env   # Completar PORTAL_DB_PASSWORD y PORTAL_JWT_SECRET

# Levantar
docker compose up -d --build

# Ver logs
docker compose logs -f
```

---

## 4. Verificar el despliegue

```bash
# Estado de contenedores
docker compose ps

# Portal cliente
curl http://localhost:3000

# Swagger backend (solo desde localhost VPS)
curl http://localhost:8091/swagger-ui.html

# Health del backend
curl http://localhost:8091/actuator/health
```

---

## 5. Actualizar el stack (nuevo push a `deploy`)

**Con Portainer:** Stack → Pull and redeploy  
**Con CLI:**
```bash
git pull origin deploy
docker compose up -d --build --remove-orphans
```

---

## 6. Arquitectura de contenedores

```
Internet
    │  :3000 (PORTAL_FRONTEND_PORT)
    ▼
┌─────────────────────┐
│  portal-frontend    │  nginx:alpine
│  (React SPA)        │  Sirve dist/ y hace proxy
│                     │  /api/v1 → portal-backend:8090
└────────┬────────────┘
         │  digitalfix-portal-net (interna)
         ▼
┌─────────────────────┐         ┌──────────────────────┐
│  portal-backend     │◄────────│  portal-db           │
│  (Spring Boot 3)    │         │  (PostgreSQL 16)     │
│  port: 8090         │         │  vol: portal-db-data │
└────────┬────────────┘         └──────────────────────┘
         │  digitalfix-net (externa — ERP)
         ▼
┌─────────────────────┐  ┌──────────────────────┐
│  ms-catalog-service │  │  ms-workorders-svc   │
│  (ERP)              │  │  (ERP)               │
└─────────────────────┘  └──────────────────────┘
```

---

## 7. Diferencias entre ramas

| Aspecto | `main` (Amazon) | `deploy` (Contabo + Portainer) |
|---|---|---|
| Configuración | Variables de entorno ECS / EC2 | `docker-compose.yml` + `.env` |
| Base de datos | RDS PostgreSQL | Contenedor `postgres:16-alpine` |
| SSL/HTTPS | ALB / ACM | Traefik o Nginx-Proxy-Manager delante |
| Secretos | AWS Secrets Manager | Variables Portainer / `.env` |
| Escalado | ECS Task replicas | `docker compose scale` manual |
| CI/CD | GitHub Actions → ECR → ECS | Portainer Git polling / webhook |

---

## 8. HTTPS en Contabo (opcional pero recomendado)

Usar **Nginx Proxy Manager** (otro stack de Portainer) o **Traefik** como reverse proxy delante del portal:

```bash
# Ejemplo: puerto 443 → portal-frontend:80 con Let's Encrypt
# Configurar en NPM: Proxy Host → localhost:3000 → dominio + SSL
```

---

## Contacto y responsables

| Rol | GitHub |
|---|---|
| Arquitectura & Backend | [@SolgreyDuocUC](https://github.com/SolgreyDuocUC) |
| Frontend & UX | [@Blacknight3648](https://github.com/Blacknight3648) |
