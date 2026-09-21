import { Blocks, Megaphone, Settings, Sparkles, Tags } from "lucide-react"
import { NavLink } from "react-router"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const shortcuts = [
  { to: "/modules", label: "Modulos", description: "Administra los modulos de la app movil", icon: Blocks },
  { to: "/config", label: "Configuracion", description: "Ajustes generales de la plataforma", icon: Settings },
  { to: "/versions", label: "Versiones", description: "Control de versiones minimas soportadas", icon: Tags },
  { to: "/announcements", label: "Anuncios", description: "Comunicados para los usuarios", icon: Megaphone },
  { to: "/welcome", label: "Bienvenida", description: "Pantalla de bienvenida de la app", icon: Sparkles },
]

export function DashboardPage() {
  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground">Bienvenido al panel de administracion de Univalle.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {shortcuts.map((shortcut) => (
          <NavLink key={shortcut.to} to={shortcut.to}>
            <Card className="h-full transition-colors hover:border-primary/50">
              <CardHeader>
                <shortcut.icon className="mb-2 size-5 text-muted-foreground" />
                <CardTitle>{shortcut.label}</CardTitle>
                <CardDescription>{shortcut.description}</CardDescription>
              </CardHeader>
            </Card>
          </NavLink>
        ))}
      </div>
    </div>
  )
}
