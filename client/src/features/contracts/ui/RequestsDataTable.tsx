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

function PowerOfAttorneyAction({
  request,
  onOpenPowerOfAttorney,
}: {
  request: RequestRow
  onOpenPowerOfAttorney?: (request: RequestRow) => void
}) {
  const isPowerOfAttorneyOpenable = canOpenPowerOfAttorney(request)
  const needsFill = requiresPowerOfAttorney(request.requestStatus) && !request.powerOfAttorney
  const hasPowerOfAttorney = Boolean(request.powerOfAttorney || request.vehicleInfo)

  const handleClick = (event: MouseEvent) => {
    event.stopPropagation()
    if (isPowerOfAttorneyOpenable && onOpenPowerOfAttorney) {
      onOpenPowerOfAttorney(request)
    }
  }

  if (needsFill) {
    return (
      <button
        type="button"
        onClick={handleClick}
        className="text-xs font-semibold text-blue-700 hover:underline"
      >
        Заполнить доверенность
      </button>
    )
  }

  if (hasPowerOfAttorney) {
    return (
      <button
        type="button"
        onClick={handleClick}
        className="text-xs font-semibold text-indigo-700 hover:underline"
      >
        Открыть
      </button>
    )
  }

  return <span className="text-xs text-slate-400">—</span>
}

function RequestsDataTable({
  requests,
  selectedRequestId,
  onOpenRequest,
  onOpenPowerOfAttorney,
}: Props) {
  if (requests.length === 0) {
    return <p className="px-3 py-6 text-center text-sm text-slate-500">Заявки пока не созданы</p>
  }

  return (
    <>
      <div className="space-y-2 p-2 md:hidden">
        {requests.map((request) => {
          const isSelected = selectedRequestId === request.id

          return (
            <article
              key={request.id}
              role="button"
              tabIndex={0}
              onClick={() => onOpenRequest?.(request)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  onOpenRequest?.(request)
                }
              }}
              className={`w-full cursor-pointer rounded-xl border px-3 py-3 text-left transition ${
                isSelected
                  ? 'border-blue-300 bg-blue-50'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold text-blue-600">{request.id}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{request.requestDate}</p>
                </div>
                <span
                  className={`shrink-0 rounded-md px-2 py-1 text-xs font-semibold ${
                    statusBadgeClasses[request.requestStatus] ?? 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {request.requestStatus}
                </span>
              </div>

              <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
                <div>
                  <dt className="text-slate-400">Договор</dt>
                  <dd className="font-medium text-slate-700">{request.requestContract}</dd>
                </div>
                <div>
                  <dt className="text-slate-400">Продукция</dt>
                  <dd className="font-medium text-slate-700">{getRequestProductKind(request)}</dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-slate-400">Поставщик</dt>
                  <dd className="font-medium text-slate-700">{request.supplier}</dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-slate-400">Адрес</dt>
                  <dd className="font-medium text-slate-700">{request.direction}</dd>
                </div>
              </dl>

              <div className="mt-3 border-t border-slate-100 pt-2">
                <PowerOfAttorneyAction
                  request={request}
                  onOpenPowerOfAttorney={onOpenPowerOfAttorney}
                />
              </div>
            </article>
          )
        })}
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="min-w-[720px] w-full border-separate border-spacing-0 text-sm lg:min-w-full lg:table-fixed">
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
              const isSelected = selectedRequestId === request.id

              return (
                <tr
                  key={request.id}
                  onClick={() => onOpenRequest?.(request)}
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
                  <td className="border-b border-slate-100 px-3 py-3 text-center">
                    <PowerOfAttorneyAction
                      request={request}
                      onOpenPowerOfAttorney={onOpenPowerOfAttorney}
                    />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}

export default RequestsDataTable
