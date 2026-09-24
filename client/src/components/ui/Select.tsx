import { useEffect, useId, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react'
import { createPortal } from 'react-dom'

export type SelectOption = {
  value: string
  label: string
}

type Props = {
  value: string
  options: SelectOption[]
  onChange: (value: string) => void
  disabled?: boolean
  className?: string
}

const triggerClass =
  'flex w-full items-center justify-between gap-2 rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-left text-sm text-slate-700 outline-none focus:border-blue-400 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400'

function Select({ value, options, onChange, disabled, className = '' }: Props) {
  const listId = useId()
  const buttonRef = useRef<HTMLButtonElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const [open, setOpen] = useState(false)
  const [menuStyle, setMenuStyle] = useState<CSSProperties | null>(null)
  const selected = options.find((option) => option.value === value)
  const selectedIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  )

  const getMenuStyle = (): CSSProperties | null => {
    const trigger = buttonRef.current
    if (!trigger) {
      return null
    }

    const rect = trigger.getBoundingClientRect()
    const menuMaxHeight = 240
    const gap = 4
    const spaceBelow = window.innerHeight - rect.bottom - gap
    const openUp = spaceBelow < Math.min(menuMaxHeight, options.length * 36) && rect.top > spaceBelow

    return {
      position: 'fixed',
      left: rect.left,
      width: rect.width,
      zIndex: 80,
      maxHeight: menuMaxHeight,
      ...(openUp
        ? { bottom: window.innerHeight - rect.top + gap }
        : { top: rect.bottom + gap }),
    }
  }

  const openMenu = () => {
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
      if (buttonRef.current?.contains(target) || listRef.current?.contains(target)) {
        return
      }
      closeMenu()
    }

    const onKey = (event: globalThis.KeyboardEvent) => {
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
  }, [open, options.length])

  useEffect(() => {
    if (!open) {
      return
    }

    const list = listRef.current
    const selectedItem = list?.querySelector<HTMLElement>('[data-selected="true"]')
    if (list && selectedItem) {
      const listTop = list.scrollTop
      const itemTop = selectedItem.offsetTop
      const itemBottom = itemTop + selectedItem.offsetHeight
      const visibleBottom = listTop + list.clientHeight

      if (itemTop < listTop) {
        list.scrollTop = itemTop
      } else if (itemBottom > visibleBottom) {
        list.scrollTop = itemBottom - list.clientHeight
      }
    }

    list?.focus({ preventScroll: true })
  }, [open, value])

  const selectValue = (nextValue: string) => {
    onChange(nextValue)
    closeMenu()
    buttonRef.current?.focus({ preventScroll: true })
  }

  const onTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) {
      return
    }

    if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      openMenu()
    }
  }

  const onListKeyDown = (event: KeyboardEvent<HTMLUListElement>) => {
    const currentIndex = selectedIndex
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      const next = options[Math.min(options.length - 1, currentIndex + 1)]
      if (next) {
        onChange(next.value)
      }
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      const prev = options[Math.max(0, currentIndex - 1)]
      if (prev) {
        onChange(prev.value)
      }
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      closeMenu()
      buttonRef.current?.focus({ preventScroll: true })
    }
  }

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
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
        onKeyDown={onTriggerKeyDown}
        className={`${triggerClass} ${className}`}
      >
        <span className={`min-w-0 truncate ${selected?.value ? 'text-slate-700' : 'text-slate-400'}`}>
          {selected?.label ?? 'Выберите'}
        </span>
        <svg
          viewBox="0 0 20 20"
          className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}
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
      </button>

      {open && menuStyle
        ? createPortal(
            <ul
              ref={listRef}
              id={listId}
              role="listbox"
              tabIndex={-1}
              data-select-menu="true"
              style={menuStyle}
              onKeyDown={onListKeyDown}
              className="modal-scrollbar overflow-y-auto rounded-xl border border-slate-200 bg-white py-1 shadow-xl outline-none"
            >
              {options.map((option) => {
                const isSelected = option.value === value

                return (
                  <li key={`${option.value}-${option.label}`} role="none">
                    <button
                      type="button"
                      role="option"
                      data-selected={isSelected}
                      aria-selected={isSelected}
                      onClick={() => selectValue(option.value)}
                      className={`flex w-full px-3 py-2 text-left text-sm ${
                        isSelected
                          ? 'bg-blue-50 font-semibold text-blue-700'
                          : 'text-slate-700 hover:bg-slate-50'
                      } ${option.value ? '' : 'text-slate-400'}`}
                    >
                      {option.label}
                    </button>
                  </li>
                )
              })}
            </ul>,
            document.body,
          )
        : null}
    </>
  )
}

export default Select
