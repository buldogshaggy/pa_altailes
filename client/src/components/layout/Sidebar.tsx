import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../features/auth'

const menuItems = [
  { label: 'Главная', path: '/' },
  { label: 'Заявки', path: '/requests' },
  { label: 'Аналитика' },
  { label: 'Отчеты', path: '/reports' },
]

function Sidebar() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const onLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <aside className="hidden w-72 flex-col bg-gradient-to-b from-[#122744] to-[#0c1c33] p-3 text-[#e8eef9] lg:flex">
      <div className="rounded-xl p-4">
        <p className="text-lg font-bold leading-tight">Личный кабинет</p>
        <p className="text-sm text-blue-100/80">контрагента</p>
      </div>

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
  )
}

export default Sidebar
