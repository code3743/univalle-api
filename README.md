# Univalle API

Backend REST que alimenta a [Univalle App](https://github.com/code3743/univalle_app): configuración remota, feature flags de versión, banner de bienvenida, novedades administradas y noticias scrapeadas de la agencia de noticias de la universidad.

## Stack

- **Runtime**: Node.js 22, TypeScript (ESM, `"type": "module"`)
- **Framework**: Express 5
- **ORM / DB**: Prisma 6 + PostgreSQL 16
- **Auth**: JWT (admin-only, sin auth pública)
- **Scraping**: Axios + Cheerio (agencia de noticias de Univalle)
- **Docs**: OpenAPI vía `swagger-jsdoc` + `swagger-ui-express` (solo fuera de `production`)
- **Validación**: Zod (env vars)
- **Package manager**: pnpm

## Arquitectura

```
src/
├── app.ts              # Configuración de Express (middlewares, rutas, error handling)
├── server.ts            # Bootstrap: arranca el server HTTP y el scheduler de noticias
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
│   └── newsScheduler.ts   # Job en memoria que re-scrapea noticias cada hora
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
| `NewsItem` | Noticias scrapeadas de la agencia de Univalle (título, resumen, imagen, URL fuente única, categoría/slug, oculto) |
| `AdminUser` | Usuarios administradores (email, hash de password con bcrypt) |

Las migraciones viven en `prisma/migrations/` y el seed inicial en `prisma/seed.ts`.

## Endpoints

Todos los endpoints están montados bajo `/api`.

### Públicos (`/api/app`)

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/health` | Health check |
| GET | `/app/config` | Snapshot de configuración para el arranque de la app (mantenimiento, versión mínima/actual según `platform` y `version`, banner, módulos habilitados) |
| GET | `/app/announcements` | Feed paginado de novedades activas |
| GET | `/app/welcome` | Banner de bienvenida vigente |
| GET | `/app/news` | Feed paginado de noticias visibles, filtrable por `category` (slug) |
| GET | `/app/news/categories` | Categorías de noticias disponibles con conteo |

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
| GET | `/admin/news` | Listar todas las noticias (visibles y ocultas) |
| POST | `/admin/news/refresh` | Disparar scraping manual (`?pages=1..10`) |
| PATCH | `/admin/news/:id` | Mostrar u ocultar una noticia |
| DELETE | `/admin/news/:id` | Eliminar una noticia |

La documentación interactiva (Swagger UI) está disponible en `GET /api/docs` cuando `NODE_ENV !== "production"`.

## Scraping y scheduler de noticias

`src/jobs/newsScheduler.ts` ejecuta `scrapeNews()` una vez al iniciar el proceso y luego cada hora (`REFRESH_INTERVAL_MS`), guardando los resultados vía `news-scraper.service.ts`. También puede dispararse manualmente con `POST /admin/news/refresh`.

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

```bash
pnpm install

# Levanta PostgreSQL en Docker (puerto 5433)
pnpm db:up

# Copia y ajusta las variables de entorno
cp .env.example .env

# Aplica migraciones y genera el cliente de Prisma
pnpm prisma:migrate

# Crea el admin inicial y datos base
pnpm prisma:seed

# Servidor en modo watch (tsx)
pnpm dev
```

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

El `Dockerfile` usa un build multi-stage (`node:22-alpine` + pnpm vía Corepack):

1. **builder**: instala dependencias completas, copia `src`/`prisma` y compila con `pnpm build`.
2. **runner**: instala solo dependencias de producción y copia el `dist/` compilado.

Al arrancar el contenedor se corre `npx prisma migrate deploy` antes de levantar el servidor (`CMD`), aplicando migraciones pendientes automáticamente. Expone el puerto `3000`.

```bash
docker build -t univalle-api .
docker run --env-file .env -p 3000:3000 univalle-api
```
