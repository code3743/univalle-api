import { useEffect, useState } from "react"
import { Pencil } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  VersionFormDialog,
  type VersionFormSubmitValues,
} from "@/components/versions/VersionFormDialog"
import { api, getApiErrorMessage } from "@/lib/api"
import type { Platform, PlatformVersion } from "@/lib/types"

const PLATFORMS: Platform[] = ["IOS", "ANDROID"]

export function VersionsPage() {
  const [versions, setVersions] = useState<Record<Platform, PlatformVersion | null>>({
    IOS: null,
    ANDROID: null,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [editingPlatform, setEditingPlatform] = useState<Platform | null>(null)

  async function loadVersions() {
    setIsLoading(true)
    try {
      const res = await api.get<PlatformVersion[]>("/admin/versions")
      const byPlatform: Record<Platform, PlatformVersion | null> = { IOS: null, ANDROID: null }
      for (const version of res.data) {
        byPlatform[version.platform] = version
      }
      setVersions(byPlatform)
    } catch (error) {
      toast.error(getApiErrorMessage(error, "No se pudieron cargar las versiones"))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadVersions()
  }, [])

  async function handleSubmit(platform: Platform, values: VersionFormSubmitValues) {
    try {
      await api.put(`/admin/versions/${platform.toLowerCase()}`, values)
      toast.success("Version actualizada")
      await loadVersions()
    } catch (error) {
      toast.error(getApiErrorMessage(error, "No se pudo guardar la version"))
      throw error
    }
  }

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Versiones</h1>
        <p className="text-muted-foreground">Control de versiones minimas soportadas por plataforma.</p>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Plataforma</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Ultima version</TableHead>
              <TableHead>Version minima</TableHead>
              <TableHead>URL de tienda</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  Cargando...
                </TableCell>
              </TableRow>
            )}
            {!isLoading &&
              PLATFORMS.map((platform) => {
                const version = versions[platform]
                return (
                  <TableRow key={platform}>
                    <TableCell className="font-medium">
                      {platform === "IOS" ? "iOS" : "Android"}
                    </TableCell>
                    <TableCell>
                      {version ? (
                        <Badge variant={version.enabled ? "default" : "secondary"}>
                          {version.enabled ? "Habilitada" : "Deshabilitada"}
                        </Badge>
                      ) : (
                        <Badge variant="outline">Sin configurar</Badge>
                      )}
                    </TableCell>
                    <TableCell>{version?.latestVersion ?? "—"}</TableCell>
                    <TableCell>{version?.minRequiredVersion ?? "—"}</TableCell>
                    <TableCell className="max-w-xs truncate text-muted-foreground">
                      {version?.storeUrl ?? "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => setEditingPlatform(platform)}>
                        <Pencil />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
          </TableBody>
        </Table>
      </div>

      <VersionFormDialog
        open={Boolean(editingPlatform)}
        onOpenChange={(open) => !open && setEditingPlatform(null)}
        platform={editingPlatform}
        version={editingPlatform ? versions[editingPlatform] : null}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
