import { createContext, useContext, useMemo, useState } from 'react'
import { http } from '../../../api/http'

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

const AUTH_STORAGE_KEY = 'pa-altailes-auth-user'

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

const readStoredUser = (): AuthUser | null => {
  const raw = localStorage.getItem(AUTH_STORAGE_KEY)

  if (!raw) {
    return null
  }

  try {
    return normalizeUser(JSON.parse(raw))
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
    try {
      const { data } = await http.post('/api/auth/login', {
        login: loginValue.trim(),
        password,
      })

      const nextUser = normalizeUser(data)
      if (!nextUser) {
        throw new Error('Неверный ответ сервера')
      }

      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextUser))
      setUser(nextUser)
    } catch {
      throw new Error('Неверный логин или пароль')
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
