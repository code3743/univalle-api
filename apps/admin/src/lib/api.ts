import axios from "axios"

export const TOKEN_STORAGE_KEY = "univalle_admin_token"

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:3000/api",
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_STORAGE_KEY)
      if (window.location.pathname !== "/login") {
        window.location.assign("/login")
      }
    }
    return Promise.reject(error)
  },
)

export function getApiErrorMessage(error: unknown, fallback = "Ocurrio un error inesperado") {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { error?: string; message?: string } | undefined
    return data?.error ?? data?.message ?? fallback
  }
  return fallback
}
