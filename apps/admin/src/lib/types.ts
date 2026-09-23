export interface AdminUser {
  id: string
  email: string
}

export interface AppModule {
  key: string
  label: string
  icon: string
  route: string
  color: string
  description: string | null
  enabledIos: boolean
  enabledAndroid: boolean
  disabled: boolean
  disabledMessage: string | null
  quickAccessOrder: number | null
  sortOrder: number
}

export type ModuleFormValues = Omit<AppModule, "description" | "disabledMessage"> & {
  description: string
  disabledMessage: string
}

export interface AppConfig {
  id: number
  maintenanceEnabled: boolean
  maintenanceTitle: string
  maintenanceMessage: string
  updatedAt: string | null
}

export type Platform = "IOS" | "ANDROID"

export interface PlatformVersion {
  id: number
  platform: Platform
  enabled: boolean
  latestVersion: string
  minRequiredVersion: string
  storeUrl: string
  updateMessage: string | null
}

export interface Announcement {
  id: number
  title: string
  description: string
  imageUrl: string | null
  active: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface WelcomeBanner {
  id: number
  enabled: boolean
  title: string
  description: string
  imageUrl: string | null
  linkUrl: string | null
  updatedAt: string | null
}
