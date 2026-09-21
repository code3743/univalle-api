# Univalle Admin

> Parte del monorepo [univalle-platform](../../README.md). Este README cubre solo `apps/admin`.

Panel de administración para gestionar la plataforma Univalle: módulos de la app, configuración (modo mantenimiento), versiones mínimas por plataforma, anuncios y el banner de bienvenida. Consume la [API de admin](../api/README.md#administración-apiadmin-requieren-authorization-bearer-token).

## Stack

- **Runtime**: Vite + React 19 + TypeScript
- **Estilos**: Tailwind CSS v4 + shadcn/ui (sobre [Base UI](https://base-ui.com), no Radix)
- **Routing**: React Router
- **HTTP**: Axios (instancia con interceptor de bearer token)
- **Notificaciones**: Sonner (toasts)
- **Iconos**: lucide-react
- **Package manager**: pnpm (workspace del monorepo)

## Arquitectura

```
src/
├── main.tsx               # Bootstrap: BrowserRouter + AuthProvider + Toaster
├── App.tsx                 # Definición de rutas
├── lib/
│   ├── api.ts               # Instancia de axios (baseURL, bearer token, manejo de 401)
│   ├── auth.tsx             # AuthProvider / useAuth (login, logout, sesión vía /admin/auth/me)
│   └── types.ts             # Tipos compartidos con las respuestas de la API
├── components/
│   ├── layout/               # AppLayout (sidebar + header), AppSidebar, ProtectedRoute
│   ├── modules/               # ModuleFormDialog (crear/editar módulo)
│   ├── versions/               # VersionFormDialog (crear/editar versión por plataforma)
│   ├── announcements/           # AnnouncementFormDialog (crear/editar anuncio)
│   └── ui/                    # Componentes shadcn/ui (generados, no editar a mano salvo necesidad)
└── pages/
    ├── LoginPage.tsx           # Login con email/password contra /admin/auth/login
    ├── DashboardPage.tsx        # Accesos directos a cada sección
    ├── ModulesPage.tsx           # CRUD de módulos de la app móvil
    ├── ConfigPage.tsx             # Form singleton: modo mantenimiento
    ├── VersionsPage.tsx            # Versión mínima/latest por plataforma (iOS/Android)
    ├── AnnouncementsPage.tsx        # CRUD de anuncios
    └── WelcomePage.tsx               # Form singleton: banner de bienvenida
```

Cada página con listado (Módulos, Anuncios) sigue el mismo patrón: `fetch` en `useEffect`, tabla con shadcn `Table`, dialog de formulario para crear/editar, `AlertDialog` para confirmar borrado y `toast` para feedback. Las páginas singleton (Configuración, Bienvenida) son un `Card` con un form que hace `GET` al montar y `PATCH` al guardar.

## Autenticación

`AuthProvider` (`src/lib/auth.tsx`) guarda el JWT en `localStorage` y lo agrega como `Authorization: Bearer <token>` en cada request (interceptor en `src/lib/api.ts`). Si la API responde `401`, el interceptor limpia el token y redirige a `/login`. `ProtectedRoute` bloquea el acceso a todo lo que no sea `/login` mientras no haya sesión válida (verificada contra `GET /admin/auth/me` al cargar la app).

## Variables de entorno

Ver `.env.example`.

| Variable | Descripción |
|---|---|
| `VITE_API_URL` | Base URL de la API (incluye el prefijo `/api`), ej. `http://localhost:3000/api` en desarrollo |

## Desarrollo local

Desde la raíz del monorepo:

```bash
pnpm install
cp apps/admin/.env.example apps/admin/.env
pnpm dev:admin   # http://localhost:5173
```

La API debe estar corriendo (ver [apps/api/README.md](../api/README.md)) para que el login y las páginas carguen datos.

### Scripts disponibles

| Script | Descripción |
|---|---|
| `pnpm dev` | Servidor de desarrollo (Vite) |
| `pnpm build` | Type-check (`tsc -b`) + build de producción a `dist/` |
| `pnpm preview` | Sirve el build de `dist/` localmente |
| `pnpm lint` | Lint con oxlint |

### Agregar componentes de shadcn/ui

```bash
pnpm dlx shadcn@latest add <componente>
```

## Despliegue

Es un sitio estático (build de Vite): no necesita Dockerfile propio. En Coolify, como **Static Site**:

- Base Directory: `apps/admin`
- Build Command: `pnpm build`
- Publish Directory: `dist`
- Variable de build: `VITE_API_URL=https://<dominio-de-la-api>/api`

El `VITE_API_URL` queda embebido en el build (Vite resuelve `import.meta.env` en build time), así que hay que redeployar si cambia la URL de la API.
