# Univalle Platform

Monorepo de la plataforma Univalle: API REST + panel de administración + landing.

## Apps

| App | Descripción | README |
|---|---|---|
| [`apps/api`](apps/api/README.md) | Backend REST (Express + Prisma + PostgreSQL) que alimenta a [Univalle App](https://github.com/code3743/univalle_app) | [apps/api/README.md](apps/api/README.md) |
| [`apps/admin`](apps/admin/README.md) | Panel de administración (Vite + React + TypeScript + Tailwind + shadcn/ui) para gestionar módulos, configuración, versiones, anuncios y bienvenida | [apps/admin/README.md](apps/admin/README.md) |
| [`apps/landing`](apps/landing/README.md) | Landing pública (Astro + Tailwind): presenta Univalle App y su política de privacidad y tratamiento de datos | [apps/landing/README.md](apps/landing/README.md) |

## Requisitos

- Node.js 22+
- pnpm 10 (`packageManager` fijado en el `package.json` raíz)
- Docker (para levantar PostgreSQL en desarrollo)

## Setup

```bash
pnpm install
```

Esto instala las dependencias de todos los workspaces (`apps/*`) desde un único lockfile en la raíz.

### API

```bash
pnpm --filter univalle-api db:up          # levanta PostgreSQL en Docker
cp apps/api/.env.example apps/api/.env    # configura variables de entorno
pnpm --filter univalle-api prisma:migrate
pnpm --filter univalle-api prisma:seed
pnpm dev:api                              # http://localhost:3000
```

Más detalles (arquitectura, endpoints, modelo de datos, despliegue) en [apps/api/README.md](apps/api/README.md).

### Admin

```bash
cp apps/admin/.env.example apps/admin/.env  # configura VITE_API_URL
pnpm dev:admin                              # http://localhost:5173
```

### Landing

```bash
pnpm dev:landing                            # http://localhost:4321
```

## Scripts en la raíz

| Script | Descripción |
|---|---|
| `pnpm dev:api` | Corre la API en modo desarrollo (`tsx watch`) |
| `pnpm dev:admin` | Corre el panel admin en modo desarrollo (Vite) |
| `pnpm dev:landing` | Corre la landing en modo desarrollo (Astro) |
| `pnpm build:api` | Compila la API a `apps/api/dist` |
| `pnpm build:admin` | Compila el panel admin a `apps/admin/dist` |
| `pnpm build:landing` | Compila la landing a `apps/landing/dist` |
| `pnpm lint` | Lint en todos los workspaces (`pnpm -r lint`) |

## Estructura

```
apps/
├── api/       # Backend REST (Express + Prisma)
├── admin/     # Panel de administración (Vite + React)
└── landing/   # Landing pública (Astro + Tailwind)
pnpm-workspace.yaml
package.json
```
