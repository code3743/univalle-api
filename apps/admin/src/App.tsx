import { Route, Routes } from "react-router"
import { AppLayout } from "@/components/layout/AppLayout"
import { ProtectedRoute } from "@/components/layout/ProtectedRoute"
import { AnnouncementsPage } from "@/pages/AnnouncementsPage"
import { ConfigPage } from "@/pages/ConfigPage"
import { DashboardPage } from "@/pages/DashboardPage"
import { LoginPage } from "@/pages/LoginPage"
import { ModulesPage } from "@/pages/ModulesPage"
import { VersionsPage } from "@/pages/VersionsPage"
import { WelcomePage } from "@/pages/WelcomePage"

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="modules" element={<ModulesPage />} />
          <Route path="config" element={<ConfigPage />} />
          <Route path="versions" element={<VersionsPage />} />
          <Route path="announcements" element={<AnnouncementsPage />} />
          <Route path="welcome" element={<WelcomePage />} />
        </Route>
      </Route>
    </Routes>
  )
}
