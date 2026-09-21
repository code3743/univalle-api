import { Blocks, LayoutDashboard, LogOut, Megaphone, Settings, Sparkles, Tags } from "lucide-react"
import { NavLink } from "react-router"
import univalleLogo from "@/assets/univalle-logo.svg"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useAuth } from "@/lib/auth"

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/modules", label: "Modulos", icon: Blocks },
  { to: "/config", label: "Configuracion", icon: Settings },
  { to: "/versions", label: "Versiones", icon: Tags },
  { to: "/announcements", label: "Anuncios", icon: Megaphone },
  { to: "/welcome", label: "Bienvenida", icon: Sparkles },
]

export function AppSidebar() {
  const { admin, logout } = useAuth()

  return (
    <Sidebar>
      <SidebarHeader className="flex-row items-center gap-2 px-4 py-3">
        <img src={univalleLogo} alt="" className="size-6" />
        <span className="text-sm font-semibold">Univalle Admin</span>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Plataforma</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.to}>
                  <SidebarMenuButton
                    render={
                      <NavLink
                        to={item.to}
                        end={item.end}
                        className={({ isActive }) =>
                          isActive ? "font-medium text-sidebar-accent-foreground" : undefined
                        }
                      />
                    }
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="gap-2 px-2 py-3">
        <span className="truncate px-2 text-xs text-muted-foreground">{admin?.email}</span>
        <SidebarMenuButton onClick={logout}>
          <LogOut />
          <span>Cerrar sesion</span>
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  )
}
