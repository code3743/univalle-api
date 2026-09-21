import { useEffect, useState } from "react"
import { Pencil, Plus, Trash2 } from "lucide-react"
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
import {
  AnnouncementFormDialog,
  type AnnouncementFormSubmitValues,
} from "@/components/announcements/AnnouncementFormDialog"
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
import { api, getApiErrorMessage } from "@/lib/api"
import type { Announcement } from "@/lib/types"

export function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null)
  const [deletingAnnouncement, setDeletingAnnouncement] = useState<Announcement | null>(null)

  async function loadAnnouncements() {
    setIsLoading(true)
    try {
      const res = await api.get<Announcement[]>("/admin/announcements")
      setAnnouncements(res.data)
    } catch (error) {
      toast.error(getApiErrorMessage(error, "No se pudieron cargar los anuncios"))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadAnnouncements()
  }, [])

  function openCreate() {
    setEditingAnnouncement(null)
    setFormOpen(true)
  }

  function openEdit(announcement: Announcement) {
    setEditingAnnouncement(announcement)
    setFormOpen(true)
  }

  async function handleSubmit(values: AnnouncementFormSubmitValues) {
    const payload = { ...values, imageUrl: values.imageUrl || undefined }
    try {
      if (editingAnnouncement) {
        await api.patch(`/admin/announcements/${editingAnnouncement.id}`, payload)
        toast.success("Anuncio actualizado")
      } else {
        await api.post("/admin/announcements", payload)
        toast.success("Anuncio creado")
      }
      await loadAnnouncements()
    } catch (error) {
      toast.error(getApiErrorMessage(error, "No se pudo guardar el anuncio"))
      throw error
    }
  }

  async function handleDelete() {
    if (!deletingAnnouncement) return
    try {
      await api.delete(`/admin/announcements/${deletingAnnouncement.id}`)
      toast.success("Anuncio eliminado")
      setDeletingAnnouncement(null)
      await loadAnnouncements()
    } catch (error) {
      toast.error(getApiErrorMessage(error, "No se pudo eliminar el anuncio"))
    }
  }

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Anuncios</h1>
          <p className="text-muted-foreground">Comunicados mostrados a los usuarios de la app.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus />
          Nuevo anuncio
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Titulo</TableHead>
              <TableHead>Descripcion</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Orden</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  Cargando...
                </TableCell>
              </TableRow>
            )}
            {!isLoading && announcements.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No hay anuncios registrados.
                </TableCell>
              </TableRow>
            )}
            {announcements.map((announcement) => (
              <TableRow key={announcement.id}>
                <TableCell className="font-medium">{announcement.title}</TableCell>
                <TableCell className="max-w-sm truncate text-muted-foreground">
                  {announcement.description}
                </TableCell>
                <TableCell>
                  <Badge variant={announcement.active ? "default" : "secondary"}>
                    {announcement.active ? "Activo" : "Inactivo"}
                  </Badge>
                </TableCell>
                <TableCell>{announcement.sortOrder}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(announcement)}>
                    <Pencil />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeletingAnnouncement(announcement)}
                  >
                    <Trash2 />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AnnouncementFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        announcement={editingAnnouncement}
        onSubmit={handleSubmit}
      />

      <AlertDialog
        open={Boolean(deletingAnnouncement)}
        onOpenChange={(open) => !open && setDeletingAnnouncement(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar anuncio</AlertDialogTitle>
            <AlertDialogDescription>
              Esta accion eliminara el anuncio "{deletingAnnouncement?.title}" de forma permanente.
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
