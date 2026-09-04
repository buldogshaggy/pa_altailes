import type { MouseEvent } from 'react'
import {
  canOpenPowerOfAttorney,
  requiresPowerOfAttorney,
  statusBadgeClasses,
} from '../model/requestStatuses'
import { getRequestProductKind } from '../model/shipmentLines'
import type { RequestRow } from '../model/types'

type Props = {
  requests: RequestRow[]
  selectedRequestId?: string | null
  onOpenRequest?: (request: RequestRow) => void
  onOpenPowerOfAttorney?: (request: RequestRow) => void
}

function RequestsDataTable({
  requests,
  selectedRequestId,
  onOpenRequest,
  onOpenPowerOfAttorney,
}: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full table-fixed border-separate border-spacing-0 text-sm">
        <colgroup>
          <col className="w-[10%]" />
          <col className="w-[11%]" />
          <col className="w-[14%]" />
          <col className="w-[11%]" />
          <col className="w-[15%]" />
          <col className="w-[13%]" />
          <col className="w-[13%]" />
          <col className="w-[13%]" />
        </colgroup>
        <thead>
          <tr>
            <th className="border-b border-slate-200 px-3 py-3 text-center font-semibold text-slate-600">
              Дата
            </th>
            <th className="border-b border-slate-200 px-3 py-3 text-center font-semibold text-slate-600">
              Номер
            </th>
            <th className="border-b border-slate-200 px-3 py-3 text-center font-semibold text-slate-600">
              Статус
            </th>
            <th className="border-b border-slate-200 px-3 py-3 text-center font-semibold text-slate-600">
              Договор
            </th>
            <th className="border-b border-slate-200 px-3 py-3 text-center font-semibold text-slate-600">
              Поставщик
            </th>
            <th className="border-b border-slate-200 px-3 py-3 text-center font-semibold text-slate-600">
              Вид продукции
            </th>
            <th className="border-b border-slate-200 px-3 py-3 text-center font-semibold text-slate-600">
              Адрес доставки
            </th>
            <th className="border-b border-slate-200 px-3 py-3 text-center font-semibold text-slate-600">
              Доверенность
            </th>
          </tr>
        </thead>

        <tbody>
          {requests.map((request) => {
            const isPowerOfAttorneyOpenable = canOpenPowerOfAttorney(request)
            const needsFill =
              requiresPowerOfAttorney(request.requestStatus) && !request.powerOfAttorney
            const hasPowerOfAttorney = Boolean(request.powerOfAttorney || request.vehicleInfo)
            const isSelected = selectedRequestId === request.id

            const handleRowClick = () => {
              onOpenRequest?.(request)
            }

            const handlePowerOfAttorneyClick = (event: MouseEvent) => {
              event.stopPropagation()
              if (isPowerOfAttorneyOpenable && onOpenPowerOfAttorney) {
                onOpenPowerOfAttorney(request)
              }
            }

            return (
              <tr
                key={request.id}
                onClick={handleRowClick}
                className={`cursor-pointer transition ${
                  isSelected ? 'bg-blue-50' : 'hover:bg-blue-50/60'
                }`}
              >
                <td className="whitespace-nowrap border-b border-slate-100 px-3 py-3 text-center font-semibold text-blue-600">
                  {request.requestDate}
                </td>
                <td className="whitespace-nowrap border-b border-slate-100 px-3 py-3 text-center text-slate-700">
                  {request.id}
                </td>
                <td className="border-b border-slate-100 px-3 py-3 text-center">
                  <span
                    className={`inline-flex rounded-md px-2 py-1 text-xs font-semibold ${
                      statusBadgeClasses[request.requestStatus] ?? 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {request.requestStatus}
                  </span>
                </td>
                <td className="border-b border-slate-100 px-3 py-3 text-center text-slate-700">
                  {request.requestContract}
                </td>
                <td className="border-b border-slate-100 px-3 py-3 text-center text-slate-700">
                  {request.supplier}
                </td>
                <td className="whitespace-nowrap border-b border-slate-100 px-3 py-3 text-center text-slate-700">
                  {getRequestProductKind(request)}
                </td>
                <td className="border-b border-slate-100 px-3 py-3 text-center text-slate-700">
                  {request.direction}
                </td>
                <td
                  className="border-b border-slate-100 px-3 py-3 text-center"
                  onClick={handlePowerOfAttorneyClick}
                >
                  {needsFill ? (
                    <span className="text-xs font-semibold text-blue-700 hover:underline">
                      Заполнить доверенность
                    </span>
                  ) : hasPowerOfAttorney ? (
                    <span className="text-xs font-semibold text-indigo-700 hover:underline">
                      Открыть
                    </span>
                  ) : isPowerOfAttorneyOpenable ? (
                    <span className="text-xs text-slate-500">—</span>
                  ) : (
                    <span className="text-xs text-slate-400">—</span>
                  )}
                </td>
              </tr>
            )
          })}

          {requests.length === 0 && (
            <tr>
              <td className="px-3 py-6 text-center text-sm text-slate-500" colSpan={8}>
                Заявки пока не созданы
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

export default RequestsDataTable
