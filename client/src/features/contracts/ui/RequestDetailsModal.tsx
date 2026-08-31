import { canOpenPowerOfAttorney, statusBadgeClasses } from '../model/requestStatuses'
import { formatFileSize, getPoaAttachmentDownloadUrl } from '../model/poaAttachment'
import { getRequestProductKind, getShipmentLines, isLumberRequest } from '../model/shipmentLines'
import type { RequestRow } from '../model/types'
import ShipmentLinesTable from './ShipmentLinesTable'

type Props = {
  request: RequestRow | null
  isOpen: boolean
  onClose: () => void
  onOpenPowerOfAttorney?: (request: RequestRow) => void
}

type DetailItemProps = {
  label: string
  value: string
}

function DetailItem({ label, value }: DetailItemProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-800">{value}</p>
    </div>
  )
}

function RequestDetailsModal({ request, isOpen, onClose, onOpenPowerOfAttorney }: Props) {
  if (!isOpen || !request) {
    return null
  }

  const shipmentLines = getShipmentLines(request)
  const hasPowerOfAttorney = Boolean(request.powerOfAttorney || request.vehicleInfo)
  const canManagePowerOfAttorney = canOpenPowerOfAttorney(request)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-white p-5 shadow-xl md:p-6">
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h3 className="text-xl font-bold text-slate-800">Заявка {request.id}</h3>
            <p className="mt-1 text-sm text-slate-500">Подробная информация по заявке</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть модальное окно"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 text-xl leading-none text-slate-600 hover:bg-slate-50"
          >
            ×
          </button>
        </div>

        <div className="mb-4">
          <span
            className={`inline-flex rounded-md px-2 py-1 text-xs font-semibold ${
              statusBadgeClasses[request.requestStatus] ?? 'bg-slate-100 text-slate-700'
            }`}
          >
            {request.requestStatus}
          </span>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <DetailItem label="Дата" value={request.requestDate} />
          <DetailItem label="Номер заявки" value={request.id} />
          <DetailItem label="Договор" value={request.requestContract} />
          <DetailItem label="Юридическое лицо" value={request.legalEntity} />
          <DetailItem label="Поставщик" value={request.supplier} />
          <DetailItem label="Вид продукции" value={getRequestProductKind(request)} />
          <DetailItem label="Адрес доставки" value={request.direction} />
        </div>

        <div className="mt-6">
          <h4 className="mb-3 text-sm font-bold text-slate-800">Отгружаемая продукция</h4>
          <ShipmentLinesTable lines={shipmentLines} />
        </div>

        {hasPowerOfAttorney ? (
          <div className="mt-6">
            <h4 className="mb-3 text-sm font-bold text-slate-800">Доверенность</h4>
            <div className="grid gap-3 md:grid-cols-2">
              {request.powerOfAttorney ? (
                <>
                  <DetailItem label="Водитель" value={request.powerOfAttorney.driverFullName} />
                  <DetailItem
                    label="Телефон водителя"
                    value={request.powerOfAttorney.driverPhoneNumber}
                  />
                  <DetailItem
                    label="Адрес в доверенности"
                    value={request.powerOfAttorney.deliveryAddress}
                  />
                  {isLumberRequest(request) && request.powerOfAttorney.borderCrossing ? (
                    <DetailItem
                      label="Переход границы"
                      value={request.powerOfAttorney.borderCrossing}
                    />
                  ) : null}
                  <DetailItem label="Перевозчик" value={request.powerOfAttorney.carrierName} />
                  {request.powerOfAttorney.attachment ? (
                    <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 md:col-span-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Файл доверенности
                      </p>
                      {request.powerOfAttorney.attachment.contentBase64 ? (
                        <a
                          href={getPoaAttachmentDownloadUrl(request.powerOfAttorney.attachment)}
                          download={request.powerOfAttorney.attachment.fileName}
                          className="mt-1 inline-flex text-sm font-semibold text-blue-700 hover:underline"
                        >
                          {request.powerOfAttorney.attachment.fileName} (
                          {formatFileSize(request.powerOfAttorney.attachment.fileSize)})
                        </a>
                      ) : (
                        <p className="mt-1 text-sm font-semibold text-slate-800">
                          {request.powerOfAttorney.attachment.fileName} (
                          {formatFileSize(request.powerOfAttorney.attachment.fileSize)})
                        </p>
                      )}
                    </div>
                  ) : null}
                </>
              ) : null}

              {request.vehicleInfo ? (
                <>
                  <DetailItem
                    label="Гос. номер автомобиля"
                    value={request.vehicleInfo.carPlateNumber}
                  />
                  <DetailItem label="Номер прицепа" value={request.vehicleInfo.trailerPlateNumber} />
                  <DetailItem
                    label="Марка и модель авто"
                    value={request.vehicleInfo.carBrandAndModel}
                  />
                  <DetailItem
                    label="Марка и модель прицепа"
                    value={request.vehicleInfo.trailerBrandAndModel}
                  />
                </>
              ) : null}
            </div>
          </div>
        ) : (
          <p className="mt-6 text-sm text-slate-500">Доверенность по заявке ещё не заполнена.</p>
        )}

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Закрыть
          </button>

          {canManagePowerOfAttorney && onOpenPowerOfAttorney ? (
            <button
              type="button"
              onClick={() => onOpenPowerOfAttorney(request)}
              className="rounded-lg border border-blue-600 bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              {hasPowerOfAttorney ? 'Редактировать доверенность' : 'Заполнить доверенность'}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export default RequestDetailsModal
