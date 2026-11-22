# Plan de Arquitectura y Tareas de Backend: Portal Cliente Monolito vs Microservicios DigitalFix

Este documento define la segregación de responsabilidades, el alcance del backend monolítico para clientes y colaboradores externos/comerciales, y las extensiones necesarias en los microservicios (`ms-catalog`, `ms-workorders`, etc.) para mantener la coherencia y estabilidad de DigitalFix.

---

## 1. Visión y Principio de Segregación

### A. Límites de Identidad y Seguridad (IDaaS vs Auth Local)
* **ERP y Operaciones de Terreno (Microservicios):**
  * **Usuarios:** Administradores, Supervisores de Cuadrilla, Técnicos en Terreno, Auditores.
  * **Identidad:** Microsoft Entra ID (Azure AD) + AWS API Gateway JWT Authorizer + Spring Security OAuth2 Resource Server.
  * **Justificación:** Operan infraestructura crítica, asignación de cuadrillas y auditoría regulatoria SEC.
* **Portal Monolítico (Clientes + Comercial / Marketing):**
  * **Usuarios:** Clientes finales (Empresas, Condominios, Particulares), Vendedores (Venta de paquetes de mantención) y Marketing (Gestión de campañas y cupones pre-aprobados).
  * **Identidad:** Base de datos relacional local (`portal_db`) + Spring Security con JWT local nativo (BCrypt).
  * **Justificación:** Cero costo de licencias Entra ID por usuario registrado; reduce drásticamente la superficie de ataque y aísla a usuarios que no deben acceder a funciones internas del ERP.

---

## 2. Mapa de Responsabilidades: Monolito vs Microservicios

| Dominio | ¿Dónde reside? | Responsabilidad y Justificación |
| :--- | :--- | :--- |
| **Autenticación Clientes / Vendedores / Marketing** | **Backend Monolítico** | Manejo de registro (RUT, Razón Social), login con JWT local, refresh tokens, perfil de contacto. |
| **Carrito y Sesión de Compra** | **Backend Monolítico** | Almacenamiento y cálculo dinámico del carrito, items temporales, cupones locales aplicados. |
| **Campañas, Banners y Cupones Pre-Aprobados** | **Backend Monolítico** | Módulo de Marketing: CRUD de cupones, promociones comerciales y vigencias (sin alterar lógica central de cobro). |
| **Paquetes y Cotizaciones Comerciales** | **Backend Monolítico** | Módulo de Vendedores: Generación de borradores de cotizaciones de mantención periódica para PyMEs y edificios. |
| **Catálogo Maestro de Servicios y Repuestos** | **`ms-catalog` (Microservicio)** | Fuente de la verdad de servicios homologados, certificados SEC y especificaciones técnicas. El monolito consume vía API REST / Caché. |
| **Inventario y Stock Físico** | **`ms-catalog` (Microservicio)** | Validación y reserva atómica de stock de repuestos y materiales de cuadrilla. |
| **Órdenes de Trabajo y Cuadrillas en Terreno** | **`ms-workorders` (Microservicio)** | Generación de la Orden de Trabajo formal (OT), asignación de cuadrillas, estados técnicos (EN_CAMINO, EN_PROCESO, FINALIZADO). |
| **Notificaciones y Alertas (Email/SMS)** | **`ms-notify` (Microservicio)** | Consumo asíncrono desde colas RabbitMQ (`q.cmd.email`, etc.) para avisar al cliente cuando cambia el estado de su orden. |

---

## 3. Arquitectura del Backend Monolítico (`digitalfix-portal-cliente-monolito/backend`)

Inspirado en el patrón desacoplado y estructurado de `One_Tech`:

### Estructura de Paquetes Sugerida (Spring Boot 3 + Java 17)
```
backend/src/main/java/com/digitalfix/portal/
├── config/
│   ├── CorsConfig.java
│   ├── SwaggerConfig.java
│   └── RestClientConfig.java (WebClient/RestClient para consultar ms-catalog y ms-workorders)
├── controller/
│   ├── auth/AuthController.java (Login, Register clientes, Refresh)
│   ├── cart/CartController.java (Carrito en sesión/BD)
│   ├── client/ClientOrderController.java (Crear pedido de servicio y ver historial propio)
│   ├── sales/SalesQuoteController.java (Vendedores: paquetes y cotizaciones para empresas)
│   └── marketing/PromoController.java (Marketing: banners, ofertas del día, cupones pre-aprobados)
├── dto/
│   ├── auth/ (LoginRequest, RegisterRequest, AuthResponse)
│   ├── cart/ (CartItemDTO, CartSummaryDTO)
│   ├── order/ (ClientOrderCreateDTO, ClientOrderTrackingDTO)
│   ├── sales/ (QuoteCreateDTO, MaintenancePlanDTO)
│   └── promo/ (CouponDTO, CampaignBannerDTO)
├── model/ (JPA Entities en PostgreSQL/MySQL local del portal)
│   ├── ClientUser.java (Roles: ROLE_CLIENT, ROLE_SELLER, ROLE_MARKETING)
│   ├── ClientOrder.java & ClientOrderItem.java
│   ├── Coupon.java
│   └── CampaignBanner.java
├── remote/ (Clientes HTTP hacia el ecosistema de Microservicios)
│   ├── CatalogServiceClient.java -> Llama a ms-catalog (/api/catalog/products, /api/catalog/stock/reserve)
│   └── WorkOrderServiceClient.java -> Llama a ms-workorders (/api/workorders/create-from-client)
├── repository/
├── security/
│   ├── JwtUtil.java
│   ├── JwtAuthenticationFilter.java
│   ├── JwtValidationFilter.java
│   └── SecurityConfig.java
└── service/
    ├── AuthService.java
    ├── CartService.java
    ├── ClientOrderService.java
    ├── SalesService.java
    └── MarketingPromoService.java
```

---

## 4. Requerimientos Funcionales por Rol

### A. Rol CLIENTE (`ROLE_CLIENT`)
1. **Autenticación Simple:** Registro sin fricciones con RUT chileno validado, nombre, email y teléfono.
2. **Navegación y Carrito:** Consultar catálogo en tiempo real (datos cacheados desde `ms-catalog`).
3. **Solicitud de Servicio / Repuesto:** Al confirmar el checkout:
   * El monolito valida cupones activos (Marketing).
   * El monolito solicita reserva de stock temporal a `ms-catalog`.
   * El monolito dispara la orden a `ms-workorders` para coordinar la cuadrilla en terreno.
4. **Seguimiento en Vivo:** Ver su orden en línea con el mismo código de seguimiento emitido por `ms-workorders`.

### B. Rol VENDEDOR COMERCIAL (`ROLE_SELLER`)
1. **Acceso al Portal Comercial:** Login local sin requerir cuenta Azure corporativa.
2. **Paquetes de Mantención Preventiva:** Seleccionar paquetes prediseñados (ej: Mantención bimestral de tableros, revisión grupo electrógeno).
3. **Creación de Cotizaciones:** Emitir propuestas para condominios/empresas asociando el RUT cliente con precios pre-pactados.
4. **Traspaso a Orden de Trabajo:** Una vez que el cliente aprueba la cotización, el vendedor la transforma en solicitud formal hacia `ms-workorders`.

### C. Rol MARKETING (`ROLE_MARKETING`)
1. **Acceso al Portal Marketing:** Login local para el equipo de marketing y comunicaciones.
2. **Gestión de Cupones Pre-Aprobados:**
   * Crear cupones de descuento (ej: `ELECTRIC-SEC-10`, `EMERGENCIA2026`).
   * Definir vigencia (fecha inicio, fecha fin), límite de usos y porcentaje o monto fijo de descuento.
   * *Regla de Negocio:* No modifica los precios base del catálogo central (`ms-catalog`), solo aplica reglas de descuento sobre el total del carrito en el monolito.
3. **Banners y Promociones Destacadas:** Configurar los banners de portada (Hero, ofertas relámpago) que se muestran en el frontend cliente.

---

## 5. Cambios Requeridos en los Microservicios

### En `ms-catalog` (Microservicio Catálogo e Inventario)
1. **Endpoint Público / B2C de Consulta:**
   * `GET /api/catalog/products`: Listado de repuestos y servicios habilitados para venta web (nombre, descripción, precio neto, categoría, imagen, badge SEC).
   * `GET /api/catalog/products/{id}`: Detalle del ítem.
2. **Endpoint de Verificación y Bloqueo de Stock:**
   * `POST /api/catalog/stock/verify-and-hold`: Permite al monolito verificar si hay stock disponible antes de confirmar el pago o la solicitud.
3. **Mapeo Claro ERP vs Portal:** Separar atributos de uso interno del taller de los atributos visibles al cliente.

### En `ms-workorders` (Microservicio Órdenes de Trabajo)
1. **Endpoint de Ingreso desde Portal Cliente:**
   * `POST /api/workorders/external`: Recibe la orden creada en el portal del cliente (incluyendo datos de contacto en terreno, dirección, tipo de servicio y repuestos requeridos).
   * Genera el ID de Orden de Trabajo estándar y publica el evento en Kafka (`workorders.events`) y RabbitMQ para notificar a la cuadrilla.
2. **Endpoint de Tracking para el Cliente:**
   * `GET /api/workorders/{id}/tracking`: Expone solo los hitos comprensibles para el cliente (Ingresada, Cuadrilla Asignada, En Camino, En Terreno, Finalizada) sin detalles sensibles internos.

---

## 6. Plan de Implementación Dividido (Alcanzable y Progresivo)

* **Fase 1 (Inmediata):** Creación del esqueleto Spring Boot en `digitalfix-portal-cliente-monolito/backend` con `Auth` local (JWT nativo), DTOs básicos y endpoints simulados (Mock).
* **Fase 2:** Integración HTTP cliente -> microservicio (`ms-catalog` para productos y stock).
* **Fase 3:** Vistas de Vendedor (Cotizaciones) y Marketing (Cupones y Banners) en el frontend.
* **Fase 4:** Integración completa de Checkout hacia `ms-workorders` y confirmación vía eventos.

