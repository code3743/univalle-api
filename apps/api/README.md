# Univalle API

> Parte del monorepo [univalle-platform](../../README.md). Este README cubre solo `apps/api`.

Backend REST que alimenta a [Univalle App](https://github.com/code3743/univalle_app): configuración remota, feature flags de versión, módulos habilitados, banner de bienvenida y novedades administradas.

> Las noticias scrapeadas de la agencia de la universidad están **deshabilitadas por ahora**: no existe router ni controller público/admin para ellas (ver [Scraping de noticias](#scraping-de-noticias-deshabilitado)).

## Stack

- **Runtime**: Node.js 22, TypeScript (ESM, `"type": "module"`)
- **Framework**: Express 5
- **ORM / DB**: Prisma 6 + PostgreSQL 16
- **Auth**: JWT (admin-only, sin auth pública)
- **Docs**: OpenAPI vía `swagger-jsdoc` + `swagger-ui-express` (solo fuera de `production`)
- **Validación**: Zod (env vars)
- **Package manager**: pnpm

## Arquitectura

```
src/
├── app.ts              # Configuración de Express (middlewares, rutas, error handling)
├── server.ts            # Bootstrap: arranca el server HTTP
├── config/
│   ├── env.ts           # Validación de variables de entorno con Zod
│   ├── prisma.ts        # Cliente Prisma singleton
│   └── swagger.ts       # Spec de OpenAPI generado desde los comentarios @openapi
├── routes/               # Definición de endpoints + documentación OpenAPI inline
├── controllers/          # Capa HTTP: parseo de request/response, sin lógica de negocio
├── services/             # Lógica de negocio y acceso a datos (Prisma)
├── middlewares/
│   ├── requireAdmin.ts    # Verifica el JWT de admin en el header Authorization
│   └── errorHandler.ts    # 404 handler + manejador central de errores (AppError)
├── jobs/
│   └── newsScheduler.ts   # Job de scraping de noticias, deshabilitado por ahora (no se invoca desde server.ts)
├── utils/                # AppError, JWT, slugify, comparación de versiones (semver)
└── types/                # Augmentación de tipos de Express (req.admin)
```

Capas: `routes` (HTTP + docs) → `controllers` (adaptación request/response) → `services` (reglas de negocio + Prisma). Los controladores no acceden a Prisma directamente.

## Modelo de datos (Prisma)

| Modelo | Propósito |
|---|---|
| `AppConfig` | Fila singleton (`id=1`) con el modo mantenimiento (activado, título, mensaje) |
| `WelcomeBanner` | Fila singleton (`id=1`) con el banner de bienvenida mostrado al abrir la app |
| `PlatformVersion` | Una fila por `Platform` (`IOS`/`ANDROID`): versión más reciente, versión mínima requerida, URL de store y si la plataforma está habilitada |
| `AppModule` | Módulos/accesos de la app (key, label, icono, ruta), con flags de habilitado por plataforma y orden de acceso rápido |
| `Announcement` | Novedades administradas (título, descripción, imagen, activo, orden) |
| `NewsItem` | Noticias de la agencia de Univalle (título, resumen, imagen, URL fuente única, categoría/slug, oculto). Modelo presente en el schema pero sin router/controller conectado por ahora |
| `AdminUser` | Usuarios administradores (email, hash de password con bcrypt) |

Las migraciones viven en `prisma/migrations/` y el seed inicial en `prisma/seed.ts`.

## Endpoints

Todos los endpoints están montados bajo `/api`.

### Públicos (`/api/app`)

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/health` | Health check |
| GET | `/app/config` | Estado de mantenimiento y de actualización de versión (`platform` requerido, `version` del cliente opcional) |
| GET | `/app/modules` | Módulos habilitados y orden de accesos rápidos (`platform` requerido) |
| GET | `/app/announcements` | Feed paginado de novedades activas |
| GET | `/app/welcome` | Banner de bienvenida vigente |

### Administración (`/api/admin/*`, requieren `Authorization: Bearer <token>`)

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/admin/auth/login` | Login de administrador (rate-limited: 10 intentos / 15 min) |
| GET | `/admin/auth/me` | Datos del admin autenticado |
| GET / PATCH | `/admin/config` | Consultar / actualizar modo mantenimiento |
| GET / PATCH | `/admin/welcome` | Consultar / actualizar banner de bienvenida |
| GET | `/admin/versions` | Listar versiones configuradas por plataforma |
| PUT | `/admin/versions/:platform` | Crear o actualizar versión mínima/latest de una plataforma |
| GET / POST | `/admin/modules` | Listar / crear módulos de la app |
| PATCH / DELETE | `/admin/modules/:key` | Actualizar / eliminar un módulo |
| GET / POST | `/admin/announcements` | Listar (todas) / crear novedades |
| PATCH / DELETE | `/admin/announcements/:id` | Actualizar / eliminar una novedad |

La documentación interactiva (Swagger UI) está disponible en `GET /api/docs` cuando `NODE_ENV !== "production"`.

## Scraping de noticias (deshabilitado)

El scraping de la agencia de noticias de Univalle está fuera de servicio por ahora: no hay router ni controller (público o admin) que lo exponga. `src/services/news-scraper.service.ts` y `src/jobs/newsScheduler.ts` siguen en el repo pero no están conectados a `app.ts`/`server.ts`, listos para reactivarse cuando se retome la feature.

## Middlewares y seguridad

- `helmet` para cabeceras de seguridad y `cors` habilitado globalmente.
- `morgan("dev")` para logging de requests.
- `express-rate-limit` en el login de admin.
- `requireAdmin` valida el JWT (`Authorization: Bearer <token>`) en todas las rutas `/admin/*` salvo `POST /admin/auth/login`.
- Manejo de errores centralizado (`errorHandler.ts`) basado en la clase `AppError`, con `notFoundHandler` para rutas inexistentes.

## Variables de entorno

Ver `.env.example`. Validadas al arrancar con Zod (`src/config/env.ts`); el proceso falla rápido si faltan o son inválidas.

| Variable | Descripción |
|---|---|
| `NODE_ENV` | `development` \| `test` \| `production` |
| `PORT` | Puerto HTTP (default `3000`) |
| `DATABASE_URL` | Connection string de PostgreSQL |
| `JWT_SECRET` | Secreto para firmar tokens de admin (mínimo 32 caracteres) |
| `JWT_EXPIRES_IN` | Expiración del token (default `12h`) |
| `BCRYPT_ROUNDS` | Rondas de hashing para passwords (default `12`) |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Credenciales usadas por el seed para crear el admin inicial |

## Desarrollo local

Desde la raíz del monorepo (`pnpm install` instala las dependencias de todos los `apps/*`):

```bash
pnpm install

# Levanta PostgreSQL en Docker (puerto 5433)
pnpm --filter univalle-api db:up

# Copia y ajusta las variables de entorno
cp apps/api/.env.example apps/api/.env

# Aplica migraciones y genera el cliente de Prisma
pnpm --filter univalle-api prisma:migrate

# Crea el admin inicial y datos base
pnpm --filter univalle-api prisma:seed

# Servidor en modo watch (tsx)
pnpm dev:api
```

O bien, parado dentro de `apps/api`, los mismos scripts sin el prefijo `--filter univalle-api`.

### Scripts disponibles

| Script | Descripción |
|---|---|
| `pnpm dev` | Servidor en modo desarrollo con recarga automática (`tsx watch`) |
| `pnpm build` | Compila TypeScript a `dist/` |
| `pnpm start` | Ejecuta el build compilado (`node dist/server.js`) |
| `pnpm lint` | Lint con ESLint |
| `pnpm prisma:generate` | Genera el cliente de Prisma |
| `pnpm prisma:migrate` | Ejecuta migraciones en desarrollo |
| `pnpm prisma:seed` | Corre el seed (`prisma/seed.ts`) |
| `pnpm prisma:studio` | Abre Prisma Studio |
| `pnpm db:up` / `pnpm db:down` | Levanta / detiene el contenedor de PostgreSQL |

## Despliegue

El `Dockerfile` usa un build multi-stage (`node:22-alpine` + pnpm vía Corepack) y **espera que el build context sea la raíz del monorepo**, no `apps/api` (necesita `pnpm-workspace.yaml` y el lockfile raíz para instalar con `pnpm --filter univalle-api`):

1. **builder**: instala solo las dependencias de `univalle-api` (`pnpm install --filter univalle-api`), genera el cliente de Prisma y compila con `tsc`.
2. **runner**: instala solo dependencias de producción del mismo filtro y copia el `dist/` compilado.

Al arrancar el contenedor se corre `npx prisma migrate deploy` antes de levantar el servidor (`CMD`), aplicando migraciones pendientes automáticamente. Expone el puerto `3000`.

```bash
# desde la raíz del monorepo
docker build -f apps/api/Dockerfile -t univalle-api .
docker run --env-file apps/api/.env -p 3000:3000 univalle-api
```

En Coolify (o cualquier plataforma que permita elegir build context + ruta del Dockerfile): **Base Directory** = `/` (raíz del repo), **Dockerfile Location** = `apps/api/Dockerfile`.
