import { useEffect, useState, type FormEvent } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { api, getApiErrorMessage } from "@/lib/api"
import type { AppConfig } from "@/lib/types"

const emptyForm = {
  maintenanceEnabled: false,
  maintenanceTitle: "",
  maintenanceMessage: "",
}

export function ConfigPage() {
  const [values, setValues] = useState(emptyForm)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    api
      .get<AppConfig>("/admin/config")
      .then((res) =>
        setValues({
          maintenanceEnabled: res.data.maintenanceEnabled,
          maintenanceTitle: res.data.maintenanceTitle,
          maintenanceMessage: res.data.maintenanceMessage,
        }),
      )
      .catch((error) => toast.error(getApiErrorMessage(error, "No se pudo cargar la configuracion")))
      .finally(() => setIsLoading(false))
  }, [])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setIsSubmitting(true)
    try {
      await api.patch("/admin/config", values)
      toast.success("Configuracion actualizada")
    } catch (error) {
      toast.error(getApiErrorMessage(error, "No se pudo guardar la configuracion"))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Configuracion</h1>
        <p className="text-muted-foreground">Modo mantenimiento de la plataforma.</p>
      </div>

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Mantenimiento</CardTitle>
          <CardDescription>
            Cuando esta activo, la app mostrara el titulo y mensaje configurados en lugar de su contenido normal.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Cargando...</p>
          ) : (
            <form className="grid gap-4" onSubmit={handleSubmit}>
              <div className="flex items-center gap-2">
                <Switch
                  id="maintenanceEnabled"
                  checked={values.maintenanceEnabled}
                  onCheckedChange={(checked) =>
                    setValues((v) => ({ ...v, maintenanceEnabled: checked }))
                  }
                />
                <Label htmlFor="maintenanceEnabled">Modo mantenimiento activo</Label>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="maintenanceTitle">Titulo</Label>
                <Input
                  id="maintenanceTitle"
                  value={values.maintenanceTitle}
                  onChange={(e) => setValues((v) => ({ ...v, maintenanceTitle: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="maintenanceMessage">Mensaje</Label>
                <Textarea
                  id="maintenanceMessage"
                  value={values.maintenanceMessage}
                  onChange={(e) =>
                    setValues((v) => ({ ...v, maintenanceMessage: e.target.value }))
                  }
                />
              </div>
              <Button type="submit" className="w-fit" disabled={isSubmitting}>
                {isSubmitting ? "Guardando..." : "Guardar"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
