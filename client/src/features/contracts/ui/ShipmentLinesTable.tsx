import type { ShipmentLine } from '../model/types'

type Props = {
  lines: ShipmentLine[]
}

function ShipmentLinesTable({ lines }: Props) {
  if (lines.length === 0) {
    return <p className="text-sm text-slate-500">Позиции для отгрузки не указаны.</p>
  }

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
      </table>
    </div>
  )
}

export default ShipmentLinesTable
