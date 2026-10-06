import { createContext, useContext, useMemo, useState } from 'react'
import { http } from '../../../api/http'
import { isDemoMode } from '../../../config'

type AuthUser = {
  fullName: string
  company: string
  login: string
  legalEntities: string[]
}

type AuthContextValue = {
  user: AuthUser | null
  isAuthenticated: boolean
  login: (login: string, password: string) => Promise<void>
  logout: () => void
}

type DemoUserCredentials = {
  password: string
  fullName: string
  company: string
  legalEntities: string[]
}

const AUTH_STORAGE_KEY = 'pa-altailes-auth-user'

const DEMO_USERS: Record<string, DemoUserCredentials> = {
  demo: {
    password: 'demo123',
    fullName: 'Иванов И. И.',
    company: 'ООО Альфа Логистик',
    legalEntities: ['ООО Альфа Логистик'],
  },
  holding: {
    password: 'holding123',
    fullName: 'Сидоров С. С.',
    company: 'ГК Алтайлес',
    legalEntities: ['ООО Куршавель', 'ООО Под Пальмой', 'ООО Викинг'],
  },
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const normalizeLegalEntities = (value: unknown, fallbackCompany?: string): string[] => {
  if (Array.isArray(value)) {
    const entities = value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)

    if (entities.length > 0) {
      return entities
    }
  }

  if (fallbackCompany?.trim()) {
    return [fallbackCompany.trim()]
  }

  return []
}

const normalizeUser = (raw: unknown): AuthUser | null => {
  if (!raw || typeof raw !== 'object') {
    return null
  }

  const candidate = raw as Partial<AuthUser>

  if (!candidate.fullName || !candidate.company || !candidate.login) {
    return null
  }

  return {
    fullName: candidate.fullName,
    company: candidate.company,
    login: candidate.login,
    legalEntities: normalizeLegalEntities(candidate.legalEntities, candidate.company),
  }
}

const loginWithDemoUsers = (loginValue: string, password: string): AuthUser => {
  const candidate = DEMO_USERS[loginValue]

  if (!candidate || candidate.password !== password) {
    throw new Error('Неверный логин или пароль')
  }

  return {
    fullName: candidate.fullName,
    company: candidate.company,
    login: loginValue,
    legalEntities: candidate.legalEntities,
  }
}

const hydrateDemoUser = (user: AuthUser): AuthUser => {
  const demoProfile = DEMO_USERS[user.login]

  if (!demoProfile) {
    return {
      ...user,
      legalEntities: normalizeLegalEntities(user.legalEntities, user.company),
    }
  }

  return {
    login: user.login,
    fullName: demoProfile.fullName,
    company: demoProfile.company,
    legalEntities: demoProfile.legalEntities,
  }
}

const readStoredUser = (): AuthUser | null => {
  const raw = localStorage.getItem(AUTH_STORAGE_KEY)

  if (!raw) {
    return null
  }

  try {
    const normalized = normalizeUser(JSON.parse(raw))

    if (!normalized) {
      return null
    }

    return isDemoMode ? hydrateDemoUser(normalized) : normalized
  } catch {
    return null
  }
}

type Props = {
  children: React.ReactNode
}

export function AuthProvider({ children }: Props) {
  const [user, setUser] = useState<AuthUser | null>(() => readStoredUser())

  const login = async (loginValue: string, password: string) => {
    const trimmedLogin = loginValue.trim()

    if (isDemoMode) {
      await new Promise((resolve) => setTimeout(resolve, 200))
      const nextUser = loginWithDemoUsers(trimmedLogin, password)
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextUser))
      setUser(nextUser)
      return
    }

    try {
      const { data } = await http.post('/api/auth/login', {
        login: trimmedLogin,
        password,
      })

      const nextUser = normalizeUser(data)
      if (!nextUser) {
        throw new Error('Неверный ответ сервера')
      }

      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextUser))
      setUser(nextUser)
    } catch {
      // Локальный fallback, если API выключен
      try {
        const nextUser = loginWithDemoUsers(trimmedLogin, password)
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextUser))
        setUser(nextUser)
      } catch {
        throw new Error('Неверный логин или пароль')
      }
    }
  }

  const logout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY)
    setUser(null)
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      login,
      logout,
    }),
    [user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context
}
