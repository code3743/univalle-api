import { useEffect, useState, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import type { Announcement } from "@/lib/types"

export interface AnnouncementFormSubmitValues {
  title: string
  description: string
  imageUrl: string
  active: boolean
  sortOrder: number
}

interface AnnouncementFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  announcement: Announcement | null
  onSubmit: (values: AnnouncementFormSubmitValues) => Promise<void>
}

const emptyForm: AnnouncementFormSubmitValues = {
  title: "",
  description: "",
  imageUrl: "",
  active: true,
  sortOrder: 0,
}

export function AnnouncementFormDialog({
  open,
  onOpenChange,
  announcement,
  onSubmit,
}: AnnouncementFormDialogProps) {
  const [values, setValues] = useState<AnnouncementFormSubmitValues>(emptyForm)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEditing = Boolean(announcement)

  useEffect(() => {
    if (open) {
      setValues(
        announcement
          ? {
              title: announcement.title,
              description: announcement.description,
              imageUrl: announcement.imageUrl ?? "",
              active: announcement.active,
              sortOrder: announcement.sortOrder,
            }
          : emptyForm,
      )
    }
  }, [open, announcement])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setIsSubmitting(true)
    try {
      await onSubmit(values)
      onOpenChange(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEditing ? "Editar anuncio" : "Nuevo anuncio"}</DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Actualiza los datos del anuncio."
                : "Completa los datos para crear un nuevo anuncio."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Titulo</Label>
              <Input
                id="title"
                required
                value={values.title}
                onChange={(e) => setValues((v) => ({ ...v, title: e.target.value }))}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Descripcion</Label>
              <Textarea
                id="description"
                required
                value={values.description}
                onChange={(e) => setValues((v) => ({ ...v, description: e.target.value }))}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="imageUrl">URL de imagen</Label>
              <Input
                id="imageUrl"
                type="url"
                value={values.imageUrl}
                onChange={(e) => setValues((v) => ({ ...v, imageUrl: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="sortOrder">Orden</Label>
                <Input
                  id="sortOrder"
                  type="number"
                  value={values.sortOrder}
                  onChange={(e) => setValues((v) => ({ ...v, sortOrder: Number(e.target.value) }))}
                />
              </div>
              <div className="flex items-center gap-2 pt-6">
                <Switch
                  id="active"
                  checked={values.active}
                  onCheckedChange={(checked) => setValues((v) => ({ ...v, active: checked }))}
                />
                <Label htmlFor="active">Activo</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
