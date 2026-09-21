import { useState, type FormEvent } from "react"
import { Navigate } from "react-router"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import univalleLogo from "@/assets/univalle-logo.svg"
import { getApiErrorMessage } from "@/lib/api"
import { useAuth } from "@/lib/auth"

export function LoginPage() {
  const { admin, isLoading, login } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isLoading && admin) {
    return <Navigate to="/" replace />
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setIsSubmitting(true)
    try {
      await login(email, password)
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Credenciales invalidas"))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <img src={univalleLogo} alt="" className="mb-2 size-10" />
          <CardTitle>Univalle Admin</CardTitle>
          <CardDescription>Inicia sesion con tu cuenta de administrador</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={handleSubmit}>
            <div className="grid gap-2">
              <Label htmlFor="email">Correo</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Contrasena</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Ingresando..." : "Ingresar"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
