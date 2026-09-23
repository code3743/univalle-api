import { useEffect, useState } from "react"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  ModuleFormDialog,
  type ModuleFormSubmitValues,
} from "@/components/modules/ModuleFormDialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { api, getApiErrorMessage } from "@/lib/api"
import type { AppModule } from "@/lib/types"
import { Pencil, Plus, Trash2 } from "lucide-react"

export function ModulesPage() {
  const [modules, setModules] = useState<AppModule[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [editingModule, setEditingModule] = useState<AppModule | null>(null)
  const [deletingModule, setDeletingModule] = useState<AppModule | null>(null)

  async function loadModules() {
    setIsLoading(true)
    try {
      const res = await api.get<AppModule[]>("/admin/modules")
      setModules(res.data)
    } catch (error) {
      toast.error(getApiErrorMessage(error, "No se pudieron cargar los modulos"))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadModules()
  }, [])

  function openCreate() {
    setEditingModule(null)
    setFormOpen(true)
  }

  function openEdit(module: AppModule) {
    setEditingModule(module)
    setFormOpen(true)
  }

  async function handleSubmit(values: ModuleFormSubmitValues) {
    try {
      if (editingModule) {
        const { key: _key, ...patch } = values
        await api.patch(`/admin/modules/${editingModule.key}`, patch)
        toast.success("Modulo actualizado")
      } else {
        await api.post("/admin/modules", values)
        toast.success("Modulo creado")
      }
      await loadModules()
    } catch (error) {
      toast.error(getApiErrorMessage(error, "No se pudo guardar el modulo"))
      throw error
    }
  }

  async function handleDelete() {
    if (!deletingModule) return
    try {
      await api.delete(`/admin/modules/${deletingModule.key}`)
      toast.success("Modulo eliminado")
      setDeletingModule(null)
      await loadModules()
    } catch (error) {
      toast.error(getApiErrorMessage(error, "No se pudo eliminar el modulo"))
    }
  }

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Modulos</h1>
          <p className="text-muted-foreground">Modulos disponibles en la app movil.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus />
          Nuevo modulo
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Color</TableHead>
              <TableHead>Key</TableHead>
              <TableHead>Etiqueta</TableHead>
              <TableHead>Ruta</TableHead>
              <TableHead>Plataformas</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Orden</TableHead>
              <TableHead>Acceso rapido</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-muted-foreground">
                  Cargando...
                </TableCell>
              </TableRow>
            )}
            {!isLoading && modules.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-muted-foreground">
                  No hay modulos registrados.
                </TableCell>
              </TableRow>
            )}
            {modules.map((module) => (
              <TableRow key={module.key}>
                <TableCell>
                  <span
                    className="inline-block size-5 rounded-full border"
                    style={{ backgroundColor: module.color }}
                    title={module.color}
                  />
                </TableCell>
                <TableCell className="font-mono text-xs">{module.key}</TableCell>
                <TableCell>{module.label}</TableCell>
                <TableCell className="text-muted-foreground">{module.route}</TableCell>
                <TableCell className="space-x-1">
                  {module.enabledIos && <Badge variant="secondary">iOS</Badge>}
                  {module.enabledAndroid && <Badge variant="secondary">Android</Badge>}
                </TableCell>
                <TableCell>
                  {module.disabled ? (
                    <Badge variant="destructive" title={module.disabledMessage ?? undefined}>
                      Deshabilitado
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Activo</Badge>
                  )}
                </TableCell>
                <TableCell>{module.sortOrder}</TableCell>
                <TableCell>{module.quickAccessOrder ?? "-"}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(module)}>
                    <Pencil />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setDeletingModule(module)}>
                    <Trash2 />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ModuleFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        module={editingModule}
        onSubmit={handleSubmit}
      />

      <AlertDialog open={Boolean(deletingModule)} onOpenChange={(open) => !open && setDeletingModule(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar modulo</AlertDialogTitle>
            <AlertDialogDescription>
              Esta accion eliminara el modulo "{deletingModule?.key}" de forma permanente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
