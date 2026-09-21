import { Navigate, Outlet } from "react-router"
import { useAuth } from "@/lib/auth"

export function ProtectedRoute() {
  const { admin, isLoading } = useAuth()

  if (isLoading) {
    return <div className="flex h-svh items-center justify-center text-sm text-muted-foreground">Cargando...</div>
  }

  if (!admin) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
