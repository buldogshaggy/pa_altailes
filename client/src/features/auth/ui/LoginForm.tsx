import { useState } from 'react'
import type { SyntheticEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../model/AuthProvider'

type LocationState = {
  from?: string
}

function LoginForm() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [loginValue, setLoginValue] = useState('demo')
  const [password, setPassword] = useState('demo123')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const from = (location.state as LocationState | null)?.from ?? '/'

  const onSubmit = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      await login(loginValue.trim(), password)
      navigate(from, { replace: true })
    } catch {
      setError('Неверный логин или пароль. Используй demo / demo123 или holding / holding123')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
        Авторизация
      </p>
      <h1 className="mt-2 text-3xl font-bold text-slate-900">Вход в кабинет</h1>

      <div className="mt-4 space-y-2 rounded-lg bg-slate-100 px-3 py-2 text-xs text-slate-600">
        <p>
          <span className="font-semibold text-slate-700">demo / demo123</span> — одно юрлицо
        </p>
        <p>
          <span className="font-semibold text-slate-700">holding / holding123</span> — группа с
          дочерними юрлицами
        </p>
      </div>

      <div className="mt-5 space-y-4">
        <label className="block text-sm font-semibold text-slate-700">
          Логин
          <input
            value={loginValue}
            onChange={(event) => setLoginValue(event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-blue-400"
            type="text"
            autoComplete="username"
          />
        </label>

        <label className="block text-sm font-semibold text-slate-700">
          Пароль
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-blue-400"
            type="password"
            autoComplete="current-password"
          />
        </label>
      </div>

      {error ? <p className="mt-3 text-sm text-rose-600">{error}</p> : null}

      <button
        type="submit"
        disabled={isLoading}
        className="mt-5 w-full rounded-lg bg-[#2d61d8] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#2858c8] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoading ? 'Входим...' : 'Войти'}
      </button>
    </form>
  )
}

export default LoginForm
