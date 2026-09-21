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
import type { AppModule } from "@/lib/types"

export interface ModuleFormSubmitValues {
  key: string
  label: string
  icon: string
  route: string
  color: string
  description?: string
  enabledIos: boolean
  enabledAndroid: boolean
  sortOrder: number
}

interface ModuleFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  module: AppModule | null
  onSubmit: (values: ModuleFormSubmitValues) => Promise<void>
}

const emptyForm: ModuleFormSubmitValues = {
  key: "",
  label: "",
  icon: "",
  route: "",
  color: "#FF0000",
  description: "",
  enabledIos: true,
  enabledAndroid: true,
  sortOrder: 0,
}

export function ModuleFormDialog({ open, onOpenChange, module, onSubmit }: ModuleFormDialogProps) {
  const [values, setValues] = useState<ModuleFormSubmitValues>(emptyForm)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEditing = Boolean(module)

  useEffect(() => {
    if (open) {
      setValues(
        module
          ? {
              key: module.key,
              label: module.label,
              icon: module.icon,
              route: module.route,
              color: module.color,
              description: module.description ?? "",
              enabledIos: module.enabledIos,
              enabledAndroid: module.enabledAndroid,
              sortOrder: module.sortOrder,
            }
          : emptyForm,
      )
    }
  }, [open, module])

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
            <DialogTitle>{isEditing ? "Editar modulo" : "Nuevo modulo"}</DialogTitle>
            <DialogDescription>
              {isEditing
                ? `Actualiza los datos del modulo "${module?.key}".`
                : "Completa los datos para crear un nuevo modulo de la app."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="key">Key</Label>
                <Input
                  id="key"
                  required
                  disabled={isEditing}
                  value={values.key}
                  onChange={(e) => setValues((v) => ({ ...v, key: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="label">Etiqueta</Label>
                <Input
                  id="label"
                  required
                  value={values.label}
                  onChange={(e) => setValues((v) => ({ ...v, label: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="icon">Icono</Label>
                <Input
                  id="icon"
                  required
                  value={values.icon}
                  onChange={(e) => setValues((v) => ({ ...v, icon: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="route">Ruta</Label>
                <Input
                  id="route"
                  required
                  value={values.route}
                  onChange={(e) => setValues((v) => ({ ...v, route: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="color">Color</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="color"
                    type="color"
                    className="h-9 w-14 p-1"
                    value={values.color}
                    onChange={(e) => setValues((v) => ({ ...v, color: e.target.value }))}
                  />
                  <Input
                    aria-label="Color hex"
                    required
                    pattern="^#[0-9A-Fa-f]{6}$"
                    value={values.color}
                    onChange={(e) => setValues((v) => ({ ...v, color: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="sortOrder">Orden</Label>
                <Input
                  id="sortOrder"
                  type="number"
                  value={values.sortOrder}
                  onChange={(e) => setValues((v) => ({ ...v, sortOrder: Number(e.target.value) }))}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Descripcion</Label>
              <Textarea
                id="description"
                value={values.description}
                onChange={(e) => setValues((v) => ({ ...v, description: e.target.value }))}
              />
            </div>

            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  id="enabledIos"
                  checked={values.enabledIos}
                  onCheckedChange={(checked) => setValues((v) => ({ ...v, enabledIos: checked }))}
                />
                <Label htmlFor="enabledIos">Habilitado en iOS</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="enabledAndroid"
                  checked={values.enabledAndroid}
                  onCheckedChange={(checked) => setValues((v) => ({ ...v, enabledAndroid: checked }))}
                />
                <Label htmlFor="enabledAndroid">Habilitado en Android</Label>
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
