# Univalle Landing

> Parte del monorepo [univalle-platform](../../README.md). Este README cubre solo `apps/landing`.

Landing pública de [Univalle App](https://github.com/code3743/univalle_app): presenta la app (qué es, su objetivo, funcionalidades) y aloja su **política de privacidad y tratamiento de datos** (`/privacidad`).

## Stack

- **Framework**: Astro 7 (sitio estático, sin server-side)
- **Estilos**: Tailwind CSS 4 (vía `@tailwindcss/vite`, sin integración `@astrojs/tailwind`)
- **Fuente**: Geist Variable (`@fontsource-variable/geist`), igual que `apps/admin`

## Estructura

```
src/
├── assets/       # Logo y otros assets procesados por Astro
├── components/   # Header, Footer, StoreBadges
├── layouts/      # Layout base (head, header, footer)
├── pages/
│   ├── index.astro        # Home
│   └── privacidad.astro   # Política de privacidad y tratamiento de datos
└── styles/
    └── global.css  # Import de Tailwind + tokens de tema (color de marca, fuente)
```

## Variables de entorno

```bash
cp .env.example .env   # configura PUBLIC_API_URL
```

| Variable | Descripción |
|---|---|
| `PUBLIC_API_URL` | Base URL pública de `apps/api` (ej. `http://localhost:3000/api`). El prefijo `PUBLIC_` la expone a Astro y al bundle de cliente. La usa `StoreBadges` para consultar `GET /app/config?platform=android\|ios` en el navegador. |

## Desarrollo local

Desde la raíz del monorepo (`pnpm install` instala las dependencias de todos los `apps/*`):

```bash
pnpm dev:landing   # http://localhost:4321
```

O bien, parado dentro de `apps/landing`:

```bash
pnpm dev
```

### Scripts disponibles

| Script | Descripción |
|---|---|
| `pnpm dev` | Servidor de desarrollo (`astro dev`) |
| `pnpm build` | Compila el sitio estático a `dist/` |
| `pnpm preview` | Sirve el build de `dist/` localmente |

## Despliegue

`Dockerfile` multi-stage (build con Node + pnpm, sirve con nginx) pensado para Coolify, igual que `apps/admin`:

- **Build context**: raíz del monorepo
- **Dockerfile location**: `apps/landing/Dockerfile`
- **Build arg**: `PUBLIC_API_URL` — se hornea en el bundle estático en tiempo de build (`ARG`/`ENV` en el `Dockerfile`), igual que `VITE_API_URL` en `apps/admin`.

Sigue siendo un sitio 100% estático servido por nginx: `PUBLIC_API_URL` solo se usa para que el navegador de cada visitante llame directamente a `GET /app/config` (público, sin auth) al cargar la home.

## Contenido y edición

- **Home** (`src/pages/index.astro`): objetivo del proyecto y listado de funcionalidades. El CTA de descarga usa `StoreBadges` (ver abajo); "Ver el proyecto en GitHub" queda como alternativa siempre visible.
- **`StoreBadges`** (`src/components/StoreBadges.astro`): en el cliente, hace `fetch` a `{PUBLIC_API_URL}/app/config?platform=android` y `?platform=ios` (los mismos endpoints públicos que consume la app móvil) y solo muestra la tarjeta de Google Play / App Store cuando esa plataforma está habilitada (`platformEnabled`) y tiene `storeUrl`. Si ninguna está habilitada, muestra el texto "Aún no está publicada..." en su lugar. Como lee el estado real de `apps/api` en cada visita, no hace falta editar la landing cuando se habilite una tienda desde el admin.
- **Privacidad** (`src/pages/privacidad.astro`): describe qué datos toca la app, que no hay backend propio que los almacene y que las credenciales de SIRA solo viven en el dispositivo. Cualquier cambio real en cómo la app maneja datos (nuevo backend, nueva integración, analítica) debe reflejarse aquí y actualizar la fecha de "Última actualización".
