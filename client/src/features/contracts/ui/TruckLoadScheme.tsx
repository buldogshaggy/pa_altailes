import { MDF_PACKS_PER_VEHICLE } from '../model/shipmentProducts'
import type { CreateRequestItem } from '../model/types'

const PACK_COLORS = [
  { fill: '#2d61d8', soft: '#dbe7ff' },
  { fill: '#0f766e', soft: '#ccfbf1' },
  { fill: '#b45309', soft: '#ffedd5' },
  { fill: '#1d4ed8', soft: '#e0e7ff' },
  { fill: '#047857', soft: '#d1fae5' },
]

type Props = {
  items: CreateRequestItem[]
  totalPacks: number
}

function buildSlotAssignments(items: CreateRequestItem[]): Array<{
  filled: boolean
  colorIndex: number
  nomenclature: string
}> {
  const slots = Array.from({ length: MDF_PACKS_PER_VEHICLE }, () => ({
    filled: false,
    colorIndex: 0,
    nomenclature: '',
  }))

  let cursor = 0

  items.forEach((item, itemIndex) => {
    const packs = Math.max(0, Math.floor(item.packCount))
    for (let packIndex = 0; packIndex < packs; packIndex += 1) {
      if (cursor >= MDF_PACKS_PER_VEHICLE) {
        return
      }

      slots[cursor] = {
        filled: true,
        colorIndex: itemIndex % PACK_COLORS.length,
        nomenclature: item.nomenclature,
      }
      cursor += 1
    }
  })

  return slots
}

function TruckLoadScheme({ items, totalPacks }: Props) {
  const slots = buildSlotAssignments(items)
  const isComplete = totalPacks === MDF_PACKS_PER_VEHICLE
  const isOverflow = totalPacks > MDF_PACKS_PER_VEHICLE
  const fillPercent = Math.min(100, Math.round((totalPacks / MDF_PACKS_PER_VEHICLE) * 100))

  return (
    <div
      className={`overflow-hidden rounded-xl border p-4 transition-colors ${
        isComplete
          ? 'border-emerald-300 bg-gradient-to-br from-emerald-50 to-white'
          : isOverflow
            ? 'border-rose-300 bg-gradient-to-br from-rose-50 to-white'
            : 'border-slate-200 bg-gradient-to-br from-slate-50 to-white'
      }`}
    >
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-slate-800">Загрузка машины</p>
          <p className="mt-0.5 text-xs text-slate-500">
            Каждая ячейка — 1 пачка · вместимость {MDF_PACKS_PER_VEHICLE}
          </p>
        </div>
        <p
          className={`text-sm font-bold tabular-nums ${
            isComplete ? 'text-emerald-700' : isOverflow ? 'text-rose-600' : 'text-slate-700'
          }`}
        >
          {Math.min(totalPacks, MDF_PACKS_PER_VEHICLE)}/{MDF_PACKS_PER_VEHICLE}
        </p>
      </div>

      <div className="relative mx-auto w-full max-w-lg">
        <svg viewBox="0 0 520 170" className="h-auto w-full" aria-hidden="true">
          <defs>
            <linearGradient id="truck-body" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="100%" stopColor="#1e293b" />
            </linearGradient>
            <linearGradient id="truck-cabin" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#1d4ed8" />
            </linearGradient>
            <linearGradient id="truck-bed" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f8fafc" />
              <stop offset="100%" stopColor="#e2e8f0" />
            </linearGradient>
          </defs>

          {/* Ground shadow */}
          <ellipse cx="250" cy="158" rx="210" ry="8" fill="#94a3b8" opacity="0.25" />

          {/* Trailer body */}
          <rect x="28" y="34" width="330" height="96" rx="10" fill="url(#truck-body)" />
          <rect x="38" y="44" width="310" height="76" rx="6" fill="url(#truck-bed)" />
          <rect x="38" y="44" width="310" height="10" rx="3" fill="#cbd5e1" opacity="0.7" />

          {/* Cabin */}
          <path
            d="M370 58 h72 c14 0 22 10 22 22 v50 h-94 V70 c0-7 5-12 12-12 z"
            fill="url(#truck-cabin)"
          />
          <path d="M388 68 h48 c8 0 12 5 12 11 v18 H388 z" fill="#bfdbfe" opacity="0.95" />
          <rect x="448" y="98" width="10" height="18" rx="2" fill="#1e3a8a" />

          {/* Wheels */}
          <circle cx="90" cy="138" r="16" fill="#0f172a" />
          <circle cx="90" cy="138" r="7" fill="#94a3b8" />
          <circle cx="170" cy="138" r="16" fill="#0f172a" />
          <circle cx="170" cy="138" r="7" fill="#94a3b8" />
          <circle cx="300" cy="138" r="16" fill="#0f172a" />
          <circle cx="300" cy="138" r="7" fill="#94a3b8" />
          <circle cx="420" cy="138" r="16" fill="#0f172a" />
          <circle cx="420" cy="138" r="7" fill="#94a3b8" />

          {/* Pack slots — 2 rows × 4 */}
          {slots.map((slot, index) => {
            const col = index % 4
            const row = Math.floor(index / 4)
            const x = 52 + col * 74
            const y = 58 + row * 30
            const color = PACK_COLORS[slot.colorIndex] ?? PACK_COLORS[0]

            return (
              <g key={index}>
                <rect
                  x={x}
                  y={y}
                  width="64"
                  height="24"
                  rx="4"
                  fill={slot.filled ? color.fill : '#fff'}
                  stroke={slot.filled ? color.fill : '#cbd5e1'}
                  strokeWidth="1.5"
                  strokeDasharray={slot.filled ? undefined : '4 3'}
                  className={slot.filled ? 'truck-pack-slot truck-pack-slot--filled' : 'truck-pack-slot'}
                />
                {slot.filled ? (
                  <>
                    <rect
                      x={x + 4}
                      y={y + 4}
                      width="56"
                      height="5"
                      rx="1.5"
                      fill="#fff"
                      opacity="0.28"
                    />
                    <text
                      x={x + 32}
                      y={y + 16}
                      textAnchor="middle"
                      fill="#fff"
                      fontSize="10"
                      fontWeight="700"
                      fontFamily="IBM Plex Sans, sans-serif"
                    >
                      {index + 1}
                    </text>
                  </>
                ) : (
                  <text
                    x={x + 32}
                    y={y + 16}
                    textAnchor="middle"
                    fill="#94a3b8"
                    fontSize="10"
                    fontWeight="600"
                    fontFamily="IBM Plex Sans, sans-serif"
                  >
                    {index + 1}
                  </text>
                )}
              </g>
            )
          })}
        </svg>
      </div>

      <div className="mt-3">
        <div className="h-2 overflow-hidden rounded-full bg-slate-200">
          <div
            className={`h-full rounded-full transition-all duration-500 ease-out ${
              isComplete ? 'bg-emerald-500' : isOverflow ? 'bg-rose-500' : 'bg-blue-600'
            }`}
            style={{ width: `${fillPercent}%` }}
          />
        </div>
      </div>

      {items.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {items.map((item, index) => {
            const color = PACK_COLORS[index % PACK_COLORS.length]
            return (
              <span
                key={`${item.nomenclature}-${index}`}
                className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-semibold text-slate-700"
                style={{ backgroundColor: color.soft }}
              >
                <span
                  className="inline-block h-2.5 w-2.5 rounded-sm"
                  style={{ backgroundColor: color.fill }}
                />
                {item.nomenclature}: {item.packCount}
              </span>
            )
          })}
        </div>
      ) : (
        <p className="mt-3 text-center text-xs text-slate-500">
          Добавьте позиции — пачки появятся в кузове
        </p>
      )}
    </div>
  )
}

export default TruckLoadScheme
