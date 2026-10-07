import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../../features/auth'

type Props = {
  onMenuOpen: () => void
}

function TopBar({ onMenuOpen }: Props) {
  const { user } = useAuth()
  const { pathname } = useLocation()
  const [isLegalEntitiesOpen, setIsLegalEntitiesOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  const pageTitle = useMemo(() => {
    if (pathname.startsWith('/reports')) {
      return 'Отчеты'
    }

    if (pathname.startsWith('/requests')) {
      return 'Заявки'
    }

    return 'Главная'
  }, [pathname])

  const legalEntities = user?.legalEntities ?? []
  const hasChildLegalEntities = legalEntities.length > 1

  useEffect(() => {
    if (!isLegalEntitiesOpen) {
      return
    }

    const closeOnOutside = (event: MouseEvent) => {
      const target = event.target as Node
      if (userMenuRef.current?.contains(target)) {
        return
      }
      setIsLegalEntitiesOpen(false)
    }

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsLegalEntitiesOpen(false)
      }
    }

    document.addEventListener('mousedown', closeOnOutside)
    document.addEventListener('keydown', closeOnEscape)

    return () => {
      document.removeEventListener('mousedown', closeOnOutside)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [isLegalEntitiesOpen])

  useEffect(() => {
    setIsLegalEntitiesOpen(false)
  }, [pathname])

  return (
    <header className="border-b border-slate-200 bg-white px-3 py-3 sm:px-4 sm:py-4 md:px-6 xl:px-8">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onMenuOpen}
            aria-label="Открыть меню"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 xl:hidden"
          >
            <svg viewBox="0 0 20 20" className="h-5 w-5" aria-hidden="true">
              <path
                d="M3.5 5.5h13M3.5 10h13M3.5 14.5h13"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>

          <h1 className="truncate text-xl font-bold text-slate-900 sm:text-2xl">{pageTitle}</h1>
        </div>

        <div ref={userMenuRef} className="relative min-w-0 shrink">
          <button
            type="button"
            disabled={!hasChildLegalEntities}
            onClick={() => setIsLegalEntitiesOpen((open) => !open)}
            aria-expanded={hasChildLegalEntities ? isLegalEntitiesOpen : undefined}
            aria-haspopup={hasChildLegalEntities ? 'listbox' : undefined}
            className={`max-w-[11rem] rounded-lg px-2 py-1.5 text-right transition-colors sm:max-w-xs ${
              hasChildLegalEntities
                ? 'cursor-pointer hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400'
                : 'cursor-default'
            }`}
          >
            <p className="truncate text-sm font-semibold text-slate-800">
              {user?.fullName ?? 'Пользователь'}
            </p>
            <p className="truncate text-xs text-slate-500">{user?.company ?? 'Без компании'}</p>
            {hasChildLegalEntities ? (
              <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-slate-400">
                <span className="hidden sm:inline">Дочерних юрлиц:</span>
                <span className="sm:hidden">Юрлиц:</span> {legalEntities.length}
                <svg
                  viewBox="0 0 20 20"
                  className={`h-3.5 w-3.5 text-slate-400 transition-transform ${
                    isLegalEntitiesOpen ? 'rotate-180' : ''
                  }`}
                  aria-hidden="true"
                >
                  <path
                    d="M5.5 7.5 10 12l4.5-4.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </p>
            ) : null}
          </button>

          {hasChildLegalEntities && isLegalEntitiesOpen ? (
            <div
              role="listbox"
              aria-label="Дочерние юридические лица"
              className="absolute right-0 top-full z-30 mt-2 w-[min(20rem,calc(100vw-1.5rem))] rounded-xl border border-slate-200 bg-white p-2 shadow-xl"
            >
              <p className="px-2 pb-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Юридические лица
              </p>
              <ul className="max-h-64 space-y-0.5 overflow-y-auto">
                {legalEntities.map((entity) => (
                  <li
                    key={entity}
                    role="option"
                    aria-selected={false}
                    className="rounded-lg px-2.5 py-2 text-sm text-slate-700"
                  >
                    {entity}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  )
}

export default TopBar
