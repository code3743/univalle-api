import { useEffect, useState, type FormEvent } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { api, getApiErrorMessage } from "@/lib/api"
import type { WelcomeBanner } from "@/lib/types"

const emptyForm = {
  enabled: false,
  title: "",
  description: "",
  imageUrl: "",
  linkUrl: "",
}

export function WelcomePage() {
  const [values, setValues] = useState(emptyForm)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    api
      .get<WelcomeBanner>("/admin/welcome")
      .then((res) =>
        setValues({
          enabled: res.data.enabled,
          title: res.data.title,
          description: res.data.description,
          imageUrl: res.data.imageUrl ?? "",
          linkUrl: res.data.linkUrl ?? "",
        }),
      )
      .catch((error) => toast.error(getApiErrorMessage(error, "No se pudo cargar la bienvenida")))
      .finally(() => setIsLoading(false))
  }, [])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setIsSubmitting(true)
    try {
      await api.patch("/admin/welcome", {
        ...values,
        imageUrl: values.imageUrl || null,
        linkUrl: values.linkUrl || null,
      })
      toast.success("Bienvenida actualizada")
    } catch (error) {
      toast.error(getApiErrorMessage(error, "No se pudo guardar la bienvenida"))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Bienvenida</h1>
        <p className="text-muted-foreground">Banner mostrado al abrir la app.</p>
      </div>

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Banner de bienvenida</CardTitle>
          <CardDescription>Se muestra una sola vez por sesion cuando esta habilitado.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Cargando...</p>
          ) : (
            <form className="grid gap-4" onSubmit={handleSubmit}>
              <div className="flex items-center gap-2">
                <Switch
                  id="enabled"
                  checked={values.enabled}
                  onCheckedChange={(checked) => setValues((v) => ({ ...v, enabled: checked }))}
                />
                <Label htmlFor="enabled">Banner habilitado</Label>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="title">Titulo</Label>
                <Input
                  id="title"
                  value={values.title}
                  onChange={(e) => setValues((v) => ({ ...v, title: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Descripcion</Label>
                <Textarea
                  id="description"
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
              <div className="grid gap-2">
                <Label htmlFor="linkUrl">URL de destino</Label>
                <Input
                  id="linkUrl"
                  type="url"
                  value={values.linkUrl}
                  onChange={(e) => setValues((v) => ({ ...v, linkUrl: e.target.value }))}
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
