# Backend del Portal Cliente DigitalFix

Monolito Spring Boot 4 (Java 21) del portal para **clientes, Marketing y Ventas**. Maneja lo que el ERP no
tiene (identidad local, tienda, cupones, pedidos) y **delega en los microservicios** todo lo que ya es de
ellos: catálogo y stock en `ms-catalog`, órdenes de trabajo y seguimiento en `ms-workorders`. Cada pedido se
convierte en una OT que el **portal de empleados** ve y opera de inmediato.

```text
Frontend portal ──JWT local──► Backend portal ──(público B2C)────────► ms-catalog
                                    │                                  repuestos, stock, reserva (hold)
                                    └──X-Portal-Api-Key──────────────► ms-workorders /api/externo/**
                                                                        servicios, comunas, OT, seguimiento
                                                                              ▲
Portal de empleados (Angular) ──Entra ID──► BFF ──────────────────────────────┘ ve y opera las mismas OT
```

## Qué es de quién

| Dato | Dueño | En el portal |
| --- | --- | --- |
| Usuarios cliente / marketing / vendedor | **Portal** (`usuario_portal`) | JWT propio (HS256), BCrypt |
| Repuestos, precio, stock | ms-catalog | se lee en cada consulta; se reserva al comprar |
| Servicios técnicos y tarifas | ms-workorders | se lee en cada consulta |
| Imagen (Google Drive), badge, descuento, visibilidad | **Portal** (`producto_tienda`) | capa de Marketing sobre el ítem del ERP |
| Cupones | **Portal** (`cupon`) | descuentan sobre el total, nunca cambian precios del ERP |
| Pedido (precios cobrados, cupón, ítems) | **Portal** (`pedido`) | enlazado a su OT por `idOrdenTrabajo` |
| Orden de trabajo, estado, cuadrilla | ms-workorders | seguimiento en vivo |

## Flujo del checkout (`POST /api/v1/orders`)

1. Precios **del ERP** con el descuento de tienda vigente (el navegador no envía precios).
2. Cupón (si viene), validado contra el subtotal.
3. Reserva de stock de los repuestos en ms-catalog (`verify-and-hold`, todo o nada) → 409 con detalle si falta.
4. OT en ms-workorders (`POST /api/externo/ordenes-trabajo`): reutiliza al cliente por **RUT** o lo crea.
   Si falla, se **libera la reserva** y no queda nada a medias.
5. Se guarda el pedido y el uso del cupón en una transacción local.

Los repuestos quedan listados en las observaciones de la OT con el token de reserva: el supervisor los agrega
formalmente eligiendo el proveedor (regla del ERP) desde el detalle de la orden en el portal de empleados.

## Endpoints

| Ruta | Acceso |
| --- | --- |
| `POST /api/v1/auth/register` · `/login` · `/refresh` | público |
| `GET /api/v1/products` · `/products/{id}` · `/products/categories` · `/products/services` | público |
| `GET /api/v1/ubicaciones/regiones` · `/regiones/{id}/comunas` | público |
| `GET·PUT·DELETE /api/v1/users/me`, `PUT /api/v1/users/me/password` | con sesión |
| `GET /api/v1/promo-codes/{codigo}?subtotal=` | con sesión |
| `POST /api/v1/stock/verify-and-hold` · `/release-hold` | CLIENTE |
| `POST /api/v1/orders` · `GET /orders/my-orders` · `GET /orders/{PED-…\|OT-…}` | CLIENTE |
| `GET /api/v1/products/tienda` · `PUT /products/tienda/{REPUESTO\|SERVICIO}/{id}` | MARKETING |
| `GET·POST /api/v1/promo-codes` · `PUT·DELETE /promo-codes/admin/{id}` | MARKETING |

Swagger: `http://localhost:8090/swagger-ui.html` (botón *Authorize* con el `accessToken` del login).

## Ejecutar

1. Copiar `.env.example` a `.env` y completar `PORTAL_JWT_SECRET` y `MS_WORKORDERS_API_KEY`.
2. En **ms-workorders**, `PORTAL_API_KEY` con el mismo valor que `MS_WORKORDERS_API_KEY`.
3. `./mvnw spring-boot:run` (H2 en `./data` si no se define `SPRING_DATASOURCE_URL`).

Con `PORTAL_DATOS_DEMO=true`: `cliente@digitalfix.cl / Cliente123!`, `marketing@digitalfix.cl / Marketing123!`,
`vendedor@digitalfix.cl / Vendedor123!` y el cupón `BIENVENIDA10`.

## Estructura

Sigue la del backend de referencia One Tech (`controller/<Área>`, `services/<Área>` interfaz + `Impl`,
`security/` con `JwtUtil` y `filter/JwtValidationFilter`, `validations/RUN`, `exceptions/`, `config/`), más
`remote/` con los clientes de los microservicios. Los archivos originales de One Tech están intactos en
`ejemplos-one-tech/` como referencia (no se compilan).

## Pendiente

- **Vendedor**: cotizaciones y paquetes de mantención (fase 3 de `Tareas.md`).
- **Banners** de portada para Marketing (hoy se cubre con `destacado` en la capa de tienda).
- **Frontend**: los servicios de `frontend/src/services` todavía apuntan a ms-catalog y guardan los pedidos en
  `localStorage`; deben pasar a estas rutas `/api/v1` enviando `Authorization: Bearer <accessToken>`.
