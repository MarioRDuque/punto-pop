# E2E (Playwright)

Suite de testing end-to-end para los flujos de negocio más críticos, sobre un frontend y
backend reales corriendo juntos (no mocks de red del lado del browser, salvo donde se
indica explícitamente).

## Requisitos previos

1. Backend (`puntopopserver`) y Postgres levantados — ver `docker-compose.yml` en la raíz
   del monorepo, o `puntopopserver/CLAUDE.md` para correrlo standalone.
2. El backend tiene que arrancar con el context de Liquibase `e2e` activo (además de
   `dev`), para que exista el usuario y el producto de prueba que usan estos tests:

   ```
   spring.liquibase.contexts=dev,e2e
   ```

   (o `SPRING_LIQUIBASE_CONTEXTS=dev,e2e` como variable de entorno). El seed vive en
   `puntopopserver/src/main/resources/db/changelog/16-seed-e2e.sql` — no corre fuera de
   ese context, así que no afecta dev normal ni producción.

3. Frontend corriendo en `http://localhost:4200` (`npm start`).

## Correr la suite

```bash
npx playwright install --with-deps chromium   # una sola vez
npm run e2e
```

Variables de entorno (todas opcionales, tienen default para el setup local típico):

| Variable | Default | Uso |
|---|---|---|
| `E2E_BASE_URL` | `http://localhost:4200` | URL del frontend |
| `E2E_API_URL` | `http://localhost:8080/apipuntopop` | URL del backend |
| `E2E_USER_EMAIL` | `e2e@sistema.com` | Usuario sembrado por el changeset `16-seed-e2e.sql` |
| `E2E_USER_PASSWORD` | `E2eTest#2026` | Contraseña de ese usuario (solo válida en context `e2e`) |
| `E2E_PRODUCTO_CODIGO` | `E2E-PROD-001` | Producto sembrado con stock conocido |
| `PAYPHONE_TOKEN` | *(vacío)* | Si está seteado con un token de sandbox real, habilita el test de Payphone |

## Qué cubre cada spec

- **`venta-flujo-critico.spec.ts`** — login → crear venta → cobrar → verifica reducción
  de stock y que el comprobante SRI llega a un estado terminal (no se queda colgado en
  `PENDIENTE`). Corre siempre, sin dependencias externas.
- **`payphone-pago.spec.ts`** — dejar una venta pendiente (siempre corre) + iniciar un
  pago Payphone real (requiere `PAYPHONE_TOKEN` de sandbox, se salta si no está seteado).
- **`nota-credito-debito.spec.ts`** — emisión de nota de crédito. Se salta si el
  comprobante no llegó a `AUTORIZADO` (ver limitación abajo).
- **`recuperacion-clave.spec.ts`** — link de login → `/auth/forgot-password` → mensaje
  genérico de confirmación; `/auth/reset-password` sin token, con token inválido, y con
  contraseñas que no coinciden. Corre siempre. El sub-test que completa un reset real
  (token real → login con la nueva clave) se salta (ver limitación abajo).

## Limitaciones conocidas (por qué dos specs se saltan en CI/local sin credenciales)

Este entorno no tiene credenciales reales de SRI (`SRI_RUC`/`SRI_P12_*`) ni de Payphone
(`PAYPHONE_TOKEN`) configuradas, y no existe infraestructura en el repo para mockear esos
servicios externos a nivel del backend (el mock tendría que interceptar la llamada
*saliente* del backend, no del browser — fuera de alcance de Playwright y de PUN-33):

- **Nota de crédito/débito**: la UI solo muestra esos botones cuando
  `comprobante.estado === 'AUTORIZADO'` (`venta-detalle.ts`). Sin SRI real el comprobante
  siempre termina en `ERROR` (comportamiento correcto y documentado, ver PUN-13), así que
  el test se salta con un motivo explícito en vez de simular una aserción vacía.
- **Payphone `iniciar`**: sin `PAYPHONE_TOKEN` el backend no puede autenticarse contra la
  API real de Payphone.
- **Reset de contraseña con token real** (`recuperacion-clave.spec.ts`): el token que
  genera `/auth/forgot-password` solo se puede obtener leyendo el email real que manda el
  backend o consultando la base de datos directamente — Playwright no tiene acceso a
  ninguno de los dos, y por diseño no existe (ni debería existir) un endpoint que exponga
  el token. Se probó manualmente end-to-end contra el backend real durante el desarrollo
  de PUN-45.

Estos tests están completos y listos para correr en un entorno con las credenciales/acceso
correspondiente — solo requieren las variables de entorno o la infraestructura del caso.

**Follow-up sugerido**: levantar un mock del WSDL del SRI y de la API de Payphone (p. ej.
WireMock) parametrizable vía `app.sri.*`/`app.payphone.base-url`, para poder correr esos
dos flujos completos en CI sin depender de sandboxes externos.

## Bug encontrado durante esta suite — ya corregido (PUN-38)

`VentaServiceImpl.filtrar` (`puntopopserver`) armaba el filtro `q` con
`root.join("cliente")`, un **inner join** por default en JPA Criteria, que excluía del
resultado de `GET /ventas/venta/filtrar?q=...` cualquier venta sin cliente asignado
(consumidor final, el caso más común) aunque su número matchee. Se evitó en los tests
filtrando por `estado` en vez de `q`. El fix (`root.join("cliente", JoinType.LEFT)`) ya
está mergeado en `master` de `puntopopserver` (PUN-38) — los tests siguen filtrando por
`estado` porque ya estaban escritos así y funciona igual, no porque el bug siga vigente.
