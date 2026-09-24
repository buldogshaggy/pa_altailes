import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { createPortal } from 'react-dom'

type Props = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  allowClear?: boolean
}

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
const MONTHS = [
  'Январь',
  'Февраль',
  'Март',
  'Апрель',
  'Май',
  'Июнь',
  'Июль',
  'Август',
  'Сентябрь',
  'Октябрь',
  'Ноябрь',
  'Декабрь',
]

const triggerClass =
  'flex w-full items-center justify-between gap-2 rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-left text-sm text-slate-700 outline-none focus:border-blue-400 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400'

const toIso = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const parseIso = (value: string): Date | null => {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!match) {
    return null
  }

  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
}

const formatDisplay = (value: string): string => {
  const date = parseIso(value)
  if (!date) {
    return ''
  }

  return date.toLocaleDateString('ru-RU')
}

const startOfCalendar = (year: number, month: number): Date => {
  const firstDay = new Date(year, month, 1)
  const weekday = (firstDay.getDay() + 6) % 7
  firstDay.setDate(firstDay.getDate() - weekday)
  return firstDay
}

function DatePicker({
  value,
  onChange,
  placeholder = 'Выберите дату',
  disabled,
  className = '',
  allowClear = false,
}: Props) {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [menuStyle, setMenuStyle] = useState<CSSProperties | null>(null)
  const selectedDate = parseIso(value)
  const todayIso = toIso(new Date())
  const initialMonth = selectedDate ?? new Date()
  const [viewYear, setViewYear] = useState(initialMonth.getFullYear())
  const [viewMonth, setViewMonth] = useState(initialMonth.getMonth())

  const days = useMemo(() => {
    const start = startOfCalendar(viewYear, viewMonth)
    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(start)
      date.setDate(start.getDate() + index)
      return {
        iso: toIso(date),
        day: date.getDate(),
        inMonth: date.getMonth() === viewMonth,
      }
    })
  }, [viewMonth, viewYear])

  const getMenuStyle = (): CSSProperties | null => {
    const trigger = buttonRef.current
    if (!trigger) {
      return null
    }

    const rect = trigger.getBoundingClientRect()
    const panelWidth = Math.max(rect.width, 288)
    const panelHeight = 340
    const gap = 4
    const spaceBelow = window.innerHeight - rect.bottom - gap
    const openUp = spaceBelow < panelHeight && rect.top > spaceBelow
    const left = Math.min(rect.left, window.innerWidth - panelWidth - 8)

    return {
      position: 'fixed',
      left: Math.max(8, left),
      width: panelWidth,
      zIndex: 80,
      ...(openUp
        ? { bottom: window.innerHeight - rect.top + gap }
        : { top: rect.bottom + gap }),
    }
  }

  const openMenu = () => {
    const nextMonth = parseIso(value) ?? new Date()
    setViewYear(nextMonth.getFullYear())
    setViewMonth(nextMonth.getMonth())

    const nextStyle = getMenuStyle()
    if (!nextStyle) {
      return
    }
    setMenuStyle(nextStyle)
    setOpen(true)
  }

  const closeMenu = () => {
    setOpen(false)
    setMenuStyle(null)
  }

  const updatePosition = () => {
    const nextStyle = getMenuStyle()
    if (nextStyle) {
      setMenuStyle(nextStyle)
    }
  }

  useEffect(() => {
    if (!open) {
      return
    }

    const closeOnOutside = (event: MouseEvent) => {
      const target = event.target as Node
      if (buttonRef.current?.contains(target) || panelRef.current?.contains(target)) {
        return
      }
      closeMenu()
    }

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeMenu()
        buttonRef.current?.focus({ preventScroll: true })
      }
    }

    document.addEventListener('mousedown', closeOnOutside)
    document.addEventListener('keydown', onKey)
    window.addEventListener('resize', updatePosition)
    document.addEventListener('scroll', updatePosition, true)

    return () => {
      document.removeEventListener('mousedown', closeOnOutside)
      document.removeEventListener('keydown', onKey)
      window.removeEventListener('resize', updatePosition)
      document.removeEventListener('scroll', updatePosition, true)
    }
  }, [open, value])

  const shiftMonth = (offset: number) => {
    const next = new Date(viewYear, viewMonth + offset, 1)
    setViewYear(next.getFullYear())
    setViewMonth(next.getMonth())
  }

  const selectDay = (iso: string) => {
    onChange(iso)
    closeMenu()
    buttonRef.current?.focus({ preventScroll: true })
  }

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => {
          if (disabled) {
            return
          }
          if (open) {
            closeMenu()
          } else {
            openMenu()
          }
        }}
        className={`${triggerClass} ${className}`}
      >
        <span className={`min-w-0 truncate ${value ? 'text-slate-700' : 'text-slate-400'}`}>
          {value ? formatDisplay(value) : placeholder}
        </span>
        <svg viewBox="0 0 20 20" className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true">
          <rect
            x="3.5"
            y="4.5"
            width="13"
            height="12"
            rx="2"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          <path
            d="M3.5 8h13M7 3v3M13 3v3"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {open && menuStyle
        ? createPortal(
            <div
              ref={panelRef}
              data-date-picker="true"
              style={menuStyle}
              className="rounded-xl border border-slate-200 bg-white p-3 shadow-xl"
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => shiftMonth(-1)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-50"
                  aria-label="Предыдущий месяц"
                >
                  ‹
                </button>
                <p className="text-sm font-semibold text-slate-800">
                  {MONTHS[viewMonth]} {viewYear}
                </p>
                <button
                  type="button"
                  onClick={() => shiftMonth(1)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-50"
                  aria-label="Следующий месяц"
                >
                  ›
                </button>
              </div>

              <div className="mb-1 grid grid-cols-7 gap-1">
                {WEEKDAYS.map((weekday) => (
                  <span
                    key={weekday}
                    className="py-1 text-center text-[11px] font-semibold uppercase tracking-wide text-slate-400"
                  >
                    {weekday}
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {days.map((cell) => {
                  const isSelected = cell.iso === value
                  const isToday = cell.iso === todayIso

                  return (
                    <button
                      key={cell.iso}
                      type="button"
                      onClick={() => selectDay(cell.iso)}
                      className={`h-8 rounded-lg text-sm ${
                        isSelected
                          ? 'bg-blue-600 font-semibold text-white'
                          : isToday
                            ? 'bg-blue-50 font-semibold text-blue-700 hover:bg-blue-100'
                            : cell.inMonth
                              ? 'text-slate-700 hover:bg-slate-50'
                              : 'text-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {cell.day}
                    </button>
                  )
                })}
              </div>

              <div className="mt-2 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => selectDay(todayIso)}
                  className="rounded-md px-2 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-50"
                >
                  Сегодня
                </button>
                {allowClear && value ? (
                  <button
                    type="button"
                    onClick={() => {
                      onChange('')
                      closeMenu()
                    }}
                    className="rounded-md px-2 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-50"
                  >
                    Сбросить
                  </button>
                ) : null}
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  )
}

export default DatePicker
