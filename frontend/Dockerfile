# ==========================================
# Frontend del Portal Cliente DigitalFix (React + Vite)
# ==========================================
# Etapa 1: Compilación
# ==========================================
FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# ==========================================
# Etapa 2: Servidor Nginx de Producción
# ==========================================
# Sirve la SPA y reenvía /api/v1 al backend del portal: el navegador habla con un solo origen
# (sin CORS) y el backend no necesita publicarse en el host.
FROM nginx:alpine

RUN rm -rf /usr/share/nginx/html/*

# La plantilla usa ${PORTAL_BACKEND_URL}; la imagen oficial la resuelve al arrancar.
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
ENV PORTAL_BACKEND_URL=http://portal-backend:8090

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
