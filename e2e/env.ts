export const env = {
  baseURL: process.env['E2E_BASE_URL'] ?? 'http://localhost:4200',
  apiURL: process.env['E2E_API_URL'] ?? 'http://localhost:8080/apipuntopop',
  // Usuario sembrado por el changeset Liquibase 16-seed-e2e.sql (context "e2e"), ver
  // puntopopserver. No es una credencial real — solo existe si el backend arrancó con
  // spring.liquibase.contexts que incluya "e2e" (ver README de e2e/).
  userEmail: process.env['E2E_USER_EMAIL'] ?? 'e2e@sistema.com',
  userPassword: process.env['E2E_USER_PASSWORD'] ?? 'E2eTest#2026',
  productoCodigo: process.env['E2E_PRODUCTO_CODIGO'] ?? 'E2E-PROD-001',
  payphoneSandboxEnabled: !!process.env['PAYPHONE_TOKEN'],
};
