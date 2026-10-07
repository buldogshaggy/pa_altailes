import type { ShipmentLine } from '../model/types'

type Props = {
  lines: ShipmentLine[]
}

const parseAmount = (value: string): number | null => {
  const normalized = value.replace(/\s/g, '').replace(',', '.')
  if (!normalized || normalized === '—' || normalized === '-') {
    return null
  }

  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : null
}

const formatAmount = (value: number): string =>
  new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)

function ShipmentLinesTable({ lines }: Props) {
  if (lines.length === 0) {
    return <p className="text-sm text-slate-500">Позиции для отгрузки не указаны.</p>
  }

  const totalAmount = lines.reduce((sum, line) => {
    const amount = parseAmount(line.amount)
    return amount === null ? sum : sum + amount
  }, 0)

  const hasNumericAmounts = lines.some((line) => parseAmount(line.amount) !== null)
  const totalLabel = hasNumericAmounts ? formatAmount(totalAmount) : '—'

  return (
    <>
      <div className="space-y-2 md:hidden">
        {lines.map((line) => (
          <article key={line.lineNumber} className="rounded-lg border border-slate-200 px-3 py-2.5">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-semibold text-slate-800">
                <span className="mr-1.5 text-slate-400">#{line.lineNumber}</span>
                {line.nomenclature}
              </p>
              <p className="shrink-0 text-sm font-bold text-slate-900">{line.amount}</p>
            </div>
            <dl className="mt-2 grid grid-cols-3 gap-2 text-xs">
              <div>
                <dt className="text-slate-400">Кол-во</dt>
                <dd className="font-medium text-slate-700">{line.quantity}</dd>
              </div>
              <div>
                <dt className="text-slate-400">Отгружено</dt>
                <dd className="font-medium text-slate-700">{line.shipped}</dd>
              </div>
              <div>
                <dt className="text-slate-400">Цена</dt>
                <dd className="font-medium text-slate-700">{line.price}</dd>
              </div>
            </dl>
          </article>
        ))}
        <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
          <span className="font-semibold uppercase tracking-wide text-slate-500">Итого</span>
          <span className="font-bold text-slate-900">{totalLabel}</span>
        </div>
      </div>

      <div className="hidden overflow-x-auto rounded-lg border border-slate-200 md:block">
        <table className="min-w-[560px] w-full border-separate border-spacing-0 text-sm">
          <thead>
            <tr className="bg-slate-50">
              <th className="border-b border-slate-200 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                №
              </th>
              <th className="border-b border-slate-200 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Номенклатура
              </th>
              <th className="border-b border-slate-200 px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                Количество
              </th>
              <th className="border-b border-slate-200 px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                Отгружено
              </th>
              <th className="border-b border-slate-200 px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                Цена
              </th>
              <th className="border-b border-slate-200 px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                Сумма
              </th>
            </tr>
          </thead>
          <tbody>
            {lines.map((line) => (
              <tr key={line.lineNumber} className="hover:bg-slate-50/80">
                <td className="border-b border-slate-100 px-3 py-2 text-slate-700">{line.lineNumber}</td>
                <td className="border-b border-slate-100 px-3 py-2 text-slate-800">{line.nomenclature}</td>
                <td className="border-b border-slate-100 px-3 py-2 text-right text-slate-700">
                  {line.quantity}
                </td>
                <td className="border-b border-slate-100 px-3 py-2 text-right text-slate-700">
                  {line.shipped}
                </td>
                <td className="border-b border-slate-100 px-3 py-2 text-right text-slate-700">
                  {line.price}
                </td>
                <td className="border-b border-slate-100 px-3 py-2 text-right font-semibold text-slate-800">
                  {line.amount}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-slate-50">
              <td
                colSpan={5}
                className="border-t border-slate-200 px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide text-slate-500"
              >
                Итого
              </td>
              <td className="border-t border-slate-200 px-3 py-2 text-right text-sm font-bold text-slate-900">
                {totalLabel}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </>
  )
}

export default ShipmentLinesTable
