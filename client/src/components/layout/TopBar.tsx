import { useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../../features/auth'

function TopBar() {
  const { user } = useAuth()
  const { pathname } = useLocation()

  const pageTitle = useMemo(() => {
    if (pathname.startsWith('/reports')) {
      return 'Отчеты'
    }

    if (pathname.startsWith('/requests')) {
      return 'Заявки'
    }

    return 'Главная'
  }, [pathname])

  return (
    <header className="border-b border-slate-200 bg-white px-4 py-4 md:px-6 xl:px-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{pageTitle}</h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold text-slate-800">{user?.fullName ?? 'Пользователь'}</p>
            <p className="text-xs text-slate-500">{user?.company ?? 'Без компании'}</p>
            {user && user.legalEntities.length > 1 ? (
              <p className="text-xs text-slate-400">
                Дочерних юрлиц: {user.legalEntities.length}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  )
}

export default TopBar
