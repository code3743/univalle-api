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
import type { Platform, PlatformVersion } from "@/lib/types"

export interface VersionFormSubmitValues {
  latestVersion: string
  minRequiredVersion: string
  storeUrl: string
  updateMessage: string
  enabled: boolean
}

interface VersionFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  platform: Platform | null
  version: PlatformVersion | null
  onSubmit: (platform: Platform, values: VersionFormSubmitValues) => Promise<void>
}

const emptyForm: VersionFormSubmitValues = {
  latestVersion: "",
  minRequiredVersion: "",
  storeUrl: "",
  updateMessage: "",
  enabled: true,
}

export function VersionFormDialog({
  open,
  onOpenChange,
  platform,
  version,
  onSubmit,
}: VersionFormDialogProps) {
  const [values, setValues] = useState<VersionFormSubmitValues>(emptyForm)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      setValues(
        version
          ? {
              latestVersion: version.latestVersion,
              minRequiredVersion: version.minRequiredVersion,
              storeUrl: version.storeUrl,
              updateMessage: version.updateMessage ?? "",
              enabled: version.enabled,
            }
          : emptyForm,
      )
    }
  }, [open, version])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!platform) return
    setIsSubmitting(true)
    try {
      await onSubmit(platform, values)
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
            <DialogTitle>Version {platform === "IOS" ? "iOS" : "Android"}</DialogTitle>
            <DialogDescription>
              Estos valores alimentan el bloque de actualizacion de /app/config para esta plataforma.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="latestVersion">Version mas reciente</Label>
                <Input
                  id="latestVersion"
                  required
                  value={values.latestVersion}
                  onChange={(e) => setValues((v) => ({ ...v, latestVersion: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="minRequiredVersion">Version minima requerida</Label>
                <Input
                  id="minRequiredVersion"
                  required
                  value={values.minRequiredVersion}
                  onChange={(e) =>
                    setValues((v) => ({ ...v, minRequiredVersion: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="storeUrl">URL de la tienda</Label>
              <Input
                id="storeUrl"
                type="url"
                required
                value={values.storeUrl}
                onChange={(e) => setValues((v) => ({ ...v, storeUrl: e.target.value }))}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="updateMessage">Mensaje de actualizacion</Label>
              <Input
                id="updateMessage"
                value={values.updateMessage}
                onChange={(e) => setValues((v) => ({ ...v, updateMessage: e.target.value }))}
              />
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="enabled"
                checked={values.enabled}
                onCheckedChange={(checked) => setValues((v) => ({ ...v, enabled: checked }))}
              />
              <Label htmlFor="enabled">Plataforma habilitada</Label>
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
