import { useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../features/auth'

const menuItems = [
  { label: 'Главная', path: '/' },
  { label: 'Заявки', path: '/requests' },
  { label: 'Аналитика' },
  { label: 'Отчеты', path: '/reports' },
]

type Props = {
  isMobileOpen: boolean
  onMobileClose: () => void
}

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="mt-3 space-y-1">
      {menuItems.map((item, index) => {
        const commonClassName =
          'flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-medium transition'

        if (!item.path) {
          return (
            <button
              key={item.label}
              type="button"
              disabled
              className={`${commonClassName} cursor-not-allowed text-blue-100/60`}
            >
              <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-white/10 text-xs">
                {index + 1}
              </span>
              {item.label}
            </button>
          )
        }

        return (
          <NavLink
            key={item.label}
            to={item.path}
            end={item.path === '/'}
            onClick={onNavigate}
            className={({ isActive }) =>
              `${commonClassName} ${
                isActive
                  ? 'bg-[#2d61d8] text-white shadow-sm'
                  : 'text-blue-100/90 hover:bg-white/10'
              }`
            }
          >
            <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-white/10 text-xs">
              {index + 1}
            </span>
            {item.label}
          </NavLink>
        )
      })}
    </nav>
  )
}

function SidebarBrand() {
  return (
    <div className="rounded-xl p-4">
      <p className="text-lg font-bold leading-tight">Личный кабинет</p>
      <p className="text-sm text-blue-100/80">контрагента</p>
    </div>
  )
}

function Sidebar({ isMobileOpen, onMobileClose }: Props) {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const onLogout = () => {
    logout()
    onMobileClose()
    navigate('/login', { replace: true })
  }

  useEffect(() => {
    if (!isMobileOpen) {
      return
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onMobileClose()
      }
    }

    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [isMobileOpen, onMobileClose])

  return (
    <>
      <aside className="hidden w-64 shrink-0 flex-col bg-gradient-to-b from-[#122744] to-[#0c1c33] p-3 text-[#e8eef9] xl:flex xl:w-72">
        <SidebarBrand />
        <SidebarNav />
        <div className="mt-auto space-y-3 p-2">
          <button
            type="button"
            onClick={onLogout}
            className="w-full rounded-lg border border-white/15 px-3 py-2 text-left text-sm font-medium text-blue-100 hover:bg-white/10"
          >
            Выйти
          </button>
        </div>
      </aside>

      <div
        className={`fixed inset-0 z-50 xl:hidden ${isMobileOpen ? '' : 'pointer-events-none'}`}
        aria-hidden={!isMobileOpen}
      >
        <button
          type="button"
          aria-label="Закрыть меню"
          onClick={onMobileClose}
          className={`absolute inset-0 bg-slate-900/50 transition-opacity ${
            isMobileOpen ? 'opacity-100' : 'opacity-0'
          }`}
        />

        <aside
          className={`absolute inset-y-0 left-0 flex w-[min(20rem,88vw)] flex-col bg-gradient-to-b from-[#122744] to-[#0c1c33] p-3 text-[#e8eef9] shadow-2xl transition-transform duration-200 ease-out ${
            isMobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <SidebarBrand />
            <button
              type="button"
              onClick={onMobileClose}
              aria-label="Закрыть меню"
              className="mt-3 mr-1 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 text-xl leading-none text-blue-100 hover:bg-white/10"
            >
              ×
            </button>
          </div>

          <SidebarNav onNavigate={onMobileClose} />

          <div className="mt-auto space-y-3 p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
            <button
              type="button"
              onClick={onLogout}
              className="w-full rounded-lg border border-white/15 px-3 py-2 text-left text-sm font-medium text-blue-100 hover:bg-white/10"
            >
              Выйти
            </button>
          </div>
        </aside>
      </div>
    </>
  )
}

export default Sidebar
