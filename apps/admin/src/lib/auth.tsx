import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import { api, TOKEN_STORAGE_KEY } from "@/lib/api"
import type { AdminUser } from "@/lib/types"

interface AuthContextValue {
  admin: AdminUser | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY)
    if (!token) {
      setIsLoading(false)
      return
    }

    api
      .get<AdminUser>("/admin/auth/me")
      .then((res) => setAdmin(res.data))
      .catch(() => localStorage.removeItem(TOKEN_STORAGE_KEY))
      .finally(() => setIsLoading(false))
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      admin,
      isLoading,
      async login(email: string, password: string) {
        const res = await api.post<{ token: string; admin: AdminUser }>("/admin/auth/login", {
          email,
          password,
        })
        localStorage.setItem(TOKEN_STORAGE_KEY, res.data.token)
        setAdmin(res.data.admin)
      },
      logout() {
        localStorage.removeItem(TOKEN_STORAGE_KEY)
        setAdmin(null)
      },
    }),
    [admin, isLoading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider")
  return ctx
}
