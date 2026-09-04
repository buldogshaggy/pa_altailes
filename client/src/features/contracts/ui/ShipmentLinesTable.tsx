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

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <table className="min-w-full border-separate border-spacing-0 text-sm">
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
              {hasNumericAmounts ? formatAmount(totalAmount) : '—'}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}

export default ShipmentLinesTable
