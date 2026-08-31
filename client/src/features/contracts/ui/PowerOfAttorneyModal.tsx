import { useEffect, useMemo, useRef, useState, type ChangeEvent, type RefObject } from 'react'
import {
  MOCK_CARRIERS,
  findCarrierById,
  findExactTractorMatch,
  findExactTrailerMatch,
  searchTractors,
  searchTrailers,
  type CarrierTractorMatch,
  type CarrierTrailerMatch,
} from '../model/carriers'
import { formatPhoneMask, isValidRussianPhone } from '../model/phoneMask'
import { formatFileSize, readPoaAttachment } from '../model/poaAttachment'
import { getRequestProductKind, isLumberRequest } from '../model/shipmentLines'
import type {
  PowerOfAttorneyAttachment,
  RequestRow,
  UpdatePowerOfAttorneyPayload,
} from '../model/types'

type Props = {
  request: RequestRow | null
  isOpen: boolean
  onSave: (requestId: string, payload: UpdatePowerOfAttorneyPayload) => Promise<void>
  onClose: () => void
}

type PlateItem = {
  id: string
  plateNumber: string
  brandAndModel: string
  carrierId: string
  carrierName: string
}

type PlateSearchFieldProps = {
  label: string
  query: string
  selectedId: string
  isOpen: boolean
  items: PlateItem[]
  emptyLabel: string
  placeholder: string
  fieldRef: RefObject<HTMLDivElement | null>
  onQueryChange: (value: string) => void
  onOpen: () => void
  onSelect: (item: PlateItem) => void
}

function PlateSearchField({
  label,
  query,
  selectedId,
  isOpen,
  items,
  emptyLabel,
  placeholder,
  fieldRef,
  onQueryChange,
  onOpen,
  onSelect,
}: PlateSearchFieldProps) {
  return (
    <div ref={fieldRef} className="relative md:col-span-2">
      <label className="block text-sm font-semibold text-slate-700">
        {label}
        <input
          type="text"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          onFocus={onOpen}
          placeholder={placeholder}
          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-blue-400"
          autoComplete="off"
        />
      </label>

      {isOpen ? (
        <ul className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
          {items.length > 0 ? (
            items.map((item) => (
              <li key={`${item.carrierId}-${item.id}`}>
                <button
                  type="button"
                  onClick={() => onSelect(item)}
                  className={`flex w-full flex-col px-3 py-2 text-left hover:bg-blue-50 ${
                    selectedId === item.id ? 'bg-blue-50' : ''
                  }`}
                >
                  <span className="text-sm font-semibold text-slate-800">{item.plateNumber}</span>
                  <span className="text-xs text-slate-500">
                    {item.brandAndModel} · {item.carrierName}
                  </span>
                </button>
              </li>
            ))
          ) : (
            <li className="px-3 py-2 text-sm text-slate-500">{emptyLabel}</li>
          )}
        </ul>
      ) : null}
    </div>
  )
}

function toTractorPlateItem(match: CarrierTractorMatch): PlateItem {
  return {
    id: match.tractor.id,
    plateNumber: match.tractor.plateNumber,
    brandAndModel: match.tractor.brandAndModel,
    carrierId: match.carrierId,
    carrierName: match.carrierName,
  }
}

function toTrailerPlateItem(match: CarrierTrailerMatch): PlateItem {
  return {
    id: match.trailer.id,
    plateNumber: match.trailer.plateNumber,
    brandAndModel: match.trailer.brandAndModel,
    carrierId: match.carrierId,
    carrierName: match.carrierName,
  }
}

function PowerOfAttorneyModal({ request, isOpen, onSave, onClose }: Props) {
  const [driverFullName, setDriverFullName] = useState('')
  const [driverPhoneNumber, setDriverPhoneNumber] = useState('')
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [borderCrossing, setBorderCrossing] = useState('')
  const [carrierId, setCarrierId] = useState('')
  const [selectedTractorId, setSelectedTractorId] = useState('')
  const [selectedTrailerId, setSelectedTrailerId] = useState('')
  const [tractorQuery, setTractorQuery] = useState('')
  const [trailerQuery, setTrailerQuery] = useState('')
  const [isTractorListOpen, setIsTractorListOpen] = useState(false)
  const [isTrailerListOpen, setIsTrailerListOpen] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [attachmentError, setAttachmentError] = useState('')
  const [attachment, setAttachment] = useState<PowerOfAttorneyAttachment | null>(null)
  const [phoneTouched, setPhoneTouched] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const tractorFieldRef = useRef<HTMLDivElement>(null)
  const trailerFieldRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen || !request) {
      return
    }

    const savedCarrierId = request.powerOfAttorney?.carrierId ?? ''
    const savedVehicle = request.vehicleInfo

    setDriverFullName(request.powerOfAttorney?.driverFullName ?? '')
    setDriverPhoneNumber(
      request.powerOfAttorney?.driverPhoneNumber
        ? formatPhoneMask(request.powerOfAttorney.driverPhoneNumber)
        : '',
    )
    setDeliveryAddress(request.powerOfAttorney?.deliveryAddress ?? request.direction)
    setBorderCrossing(request.powerOfAttorney?.borderCrossing ?? '')
    setCarrierId(savedCarrierId)
    setSelectedTractorId(savedVehicle?.tractorId ?? '')
    setSelectedTrailerId(savedVehicle?.trailerId ?? '')
    setTractorQuery(savedVehicle?.carPlateNumber ?? '')
    setTrailerQuery(savedVehicle?.trailerPlateNumber ?? '')
    setAttachment(request.powerOfAttorney?.attachment ?? null)
    setIsTractorListOpen(false)
    setIsTrailerListOpen(false)
    setSubmitError('')
    setAttachmentError('')
    setPhoneTouched(false)
    setIsSaving(false)
  }, [isOpen, request])

  useEffect(() => {
    if (!isTractorListOpen && !isTrailerListOpen) {
      return
    }

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node
      if (isTractorListOpen && !tractorFieldRef.current?.contains(target)) {
        setIsTractorListOpen(false)
      }
      if (isTrailerListOpen && !trailerFieldRef.current?.contains(target)) {
        setIsTrailerListOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [isTractorListOpen, isTrailerListOpen])

  const selectedCarrier = useMemo(() => findCarrierById(carrierId), [carrierId])

  const filteredTractors = useMemo(
    () => searchTractors(tractorQuery, carrierId || undefined).map(toTractorPlateItem),
    [tractorQuery, carrierId],
  )

  const filteredTrailers = useMemo(
    () => searchTrailers(trailerQuery, carrierId || undefined).map(toTrailerPlateItem),
    [trailerQuery, carrierId],
  )

  const selectedTractor = useMemo(() => {
    if (!selectedCarrier || !selectedTractorId) {
      return undefined
    }

    return selectedCarrier.tractors.find((tractor) => tractor.id === selectedTractorId)
  }, [selectedCarrier, selectedTractorId])

  const selectedTrailer = useMemo(() => {
    if (!selectedCarrier || !selectedTrailerId) {
      return undefined
    }

    return selectedCarrier.trailers.find((trailer) => trailer.id === selectedTrailerId)
  }, [selectedCarrier, selectedTrailerId])

  if (!isOpen || !request) {
    return null
  }

  const isEditing = Boolean(request.powerOfAttorney || request.vehicleInfo)
  const needsBorderCrossing = isLumberRequest(request)
  const modalTitle = isEditing ? 'Доверенность по заявке' : 'Заполнить доверенность'
  const saveLabel = isEditing ? 'Сохранить изменения' : 'Сохранить'
  const isPhoneValid = isValidRussianPhone(driverPhoneNumber)
  const showPhoneError = phoneTouched && driverPhoneNumber.length > 0 && !isPhoneValid

  const canSave =
    driverFullName.trim().length > 0 &&
    isPhoneValid &&
    deliveryAddress.trim().length > 0 &&
    (!needsBorderCrossing || borderCrossing.trim().length > 0) &&
    Boolean(selectedCarrier) &&
    Boolean(selectedTractor) &&
    Boolean(selectedTrailer)

  const clearTrailerIfCarrierChanged = (nextCarrierId: string) => {
    const nextCarrier = findCarrierById(nextCarrierId)
    const trailerStillValid = nextCarrier?.trailers.some((trailer) => trailer.id === selectedTrailerId)
    if (!trailerStillValid) {
      setSelectedTrailerId('')
      setTrailerQuery('')
    }
  }

  const clearTractorIfCarrierChanged = (nextCarrierId: string) => {
    const nextCarrier = findCarrierById(nextCarrierId)
    const tractorStillValid = nextCarrier?.tractors.some((tractor) => tractor.id === selectedTractorId)
    if (!tractorStillValid) {
      setSelectedTractorId('')
      setTractorQuery('')
    }
  }

  const applyTractorMatch = (match: CarrierTractorMatch) => {
    setCarrierId(match.carrierId)
    clearTrailerIfCarrierChanged(match.carrierId)
    setSelectedTractorId(match.tractor.id)
    setTractorQuery(match.tractor.plateNumber)
    setIsTractorListOpen(false)
  }

  const applyTrailerMatch = (match: CarrierTrailerMatch) => {
    setCarrierId(match.carrierId)
    clearTractorIfCarrierChanged(match.carrierId)
    setSelectedTrailerId(match.trailer.id)
    setTrailerQuery(match.trailer.plateNumber)
    setIsTrailerListOpen(false)
  }

  const handleCarrierChange = (nextCarrierId: string) => {
    setCarrierId(nextCarrierId)
    setSelectedTractorId('')
    setSelectedTrailerId('')
    setTractorQuery('')
    setTrailerQuery('')
    setIsTractorListOpen(false)
    setIsTrailerListOpen(false)
  }

  const handleTractorQueryChange = (value: string) => {
    setTractorQuery(value.toUpperCase())
    setSelectedTractorId('')
    setIsTractorListOpen(true)
    setIsTrailerListOpen(false)

    const exactMatch = findExactTractorMatch(value)
    if (exactMatch) {
      applyTractorMatch(exactMatch)
    }
  }

  const handleTrailerQueryChange = (value: string) => {
    setTrailerQuery(value.toUpperCase())
    setSelectedTrailerId('')
    setIsTrailerListOpen(true)
    setIsTractorListOpen(false)

    const exactMatch = findExactTrailerMatch(value)
    if (exactMatch) {
      applyTrailerMatch(exactMatch)
    }
  }

  const handleAttachmentChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file) {
      return
    }

    setAttachmentError('')

    try {
      const nextAttachment = await readPoaAttachment(file)
      setAttachment(nextAttachment)
    } catch (error) {
      setAttachment(null)
      setAttachmentError(error instanceof Error ? error.message : 'Не удалось прикрепить файл')
    }
  }

  const handleSave = async () => {
    setPhoneTouched(true)

    if (!canSave || !selectedCarrier || !selectedTractor || !selectedTrailer) {
      return
    }

    setSubmitError('')
    setIsSaving(true)

    try {
      await onSave(request.id, {
        driverFullName: driverFullName.trim(),
        driverPhoneNumber: formatPhoneMask(driverPhoneNumber),
        deliveryAddress: deliveryAddress.trim(),
        borderCrossing: needsBorderCrossing ? borderCrossing.trim() : undefined,
        carrierId: selectedCarrier.id,
        carrierName: selectedCarrier.name,
        attachment: attachment ?? undefined,
        vehicleInfo: {
          tractorId: selectedTractor.id,
          trailerId: selectedTrailer.id,
          carPlateNumber: selectedTractor.plateNumber,
          trailerPlateNumber: selectedTrailer.plateNumber,
          carBrandAndModel: selectedTractor.brandAndModel,
          trailerBrandAndModel: selectedTrailer.brandAndModel,
        },
      })
      onClose()
    } catch {
      setSubmitError('Не удалось сохранить доверенность. Попробуйте еще раз.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-5 shadow-xl md:p-6">
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h3 className="text-xl font-bold text-slate-800">{modalTitle}</h3>
            <p className="mt-1 text-sm text-slate-500">
              Заявка {request.id} · {getRequestProductKind(request)}
              {isEditing ? ' · нажмите «Сохранить изменения», чтобы обновить данные' : null}
            </p>
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

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block text-sm font-semibold text-slate-700 md:col-span-2">
            Водитель (ФИО)
            <input
              type="text"
              value={driverFullName}
              onChange={(event) => setDriverFullName(event.target.value)}
              placeholder="Иванов Иван Иванович"
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-blue-400"
            />
          </label>

          <label className="block text-sm font-semibold text-slate-700 md:col-span-2">
            Номер телефона водителя
            <input
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={driverPhoneNumber}
              onChange={(event) =>
                setDriverPhoneNumber(formatPhoneMask(event.target.value, driverPhoneNumber))
              }
              onBlur={() => setPhoneTouched(true)}
              placeholder="+7 (999) 123-45-67"
              className={`mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-blue-400 ${
                showPhoneError ? 'border-rose-400' : 'border-slate-300'
              }`}
            />
            {showPhoneError ? (
              <span className="mt-1 block text-xs font-normal text-rose-600">
                Введите номер в формате +7 (XXX) XXX-XX-XX
              </span>
            ) : null}
          </label>

          <label className="block text-sm font-semibold text-slate-700 md:col-span-2">
            Адрес доставки
            <input
              type="text"
              value={deliveryAddress}
              onChange={(event) => setDeliveryAddress(event.target.value)}
              placeholder="Например, Екатеринбург"
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-blue-400"
            />
          </label>

          {needsBorderCrossing ? (
            <label className="block text-sm font-semibold text-slate-700 md:col-span-2">
              Переход границы
              <input
                type="text"
                value={borderCrossing}
                onChange={(event) => setBorderCrossing(event.target.value)}
                placeholder="Например, Семей"
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-blue-400"
              />
            </label>
          ) : null}

          <label className="block text-sm font-semibold text-slate-700 md:col-span-2">
            Перевозчик
            <select
              value={carrierId}
              onChange={(event) => handleCarrierChange(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-400"
            >
              <option value="">Выберите перевозчика или найдите по номеру ТС</option>
              {MOCK_CARRIERS.map((carrier) => (
                <option key={carrier.id} value={carrier.id}>
                  {carrier.name}
                </option>
              ))}
            </select>
            <span className="mt-1 block text-xs font-normal text-slate-500">
              Можно не выбирать вручную: при вводе номера машины или прицепа перевозчик подставится сам
            </span>
          </label>

          <PlateSearchField
            label="Автомобиль"
            query={tractorQuery}
            selectedId={selectedTractorId}
            isOpen={isTractorListOpen}
            items={filteredTractors}
            emptyLabel="Автомобили не найдены"
            placeholder="Введите или выберите гос. номер"
            fieldRef={tractorFieldRef}
            onQueryChange={handleTractorQueryChange}
            onOpen={() => {
              setIsTractorListOpen(true)
              setIsTrailerListOpen(false)
            }}
            onSelect={(item) =>
              applyTractorMatch({
                carrierId: item.carrierId,
                carrierName: item.carrierName,
                tractor: {
                  id: item.id,
                  plateNumber: item.plateNumber,
                  brandAndModel: item.brandAndModel,
                },
              })
            }
          />

          <PlateSearchField
            label="Прицеп"
            query={trailerQuery}
            selectedId={selectedTrailerId}
            isOpen={isTrailerListOpen}
            items={filteredTrailers}
            emptyLabel="Прицепы не найдены"
            placeholder="Введите или выберите номер прицепа"
            fieldRef={trailerFieldRef}
            onQueryChange={handleTrailerQueryChange}
            onOpen={() => {
              setIsTrailerListOpen(true)
              setIsTractorListOpen(false)
            }}
            onSelect={(item) =>
              applyTrailerMatch({
                carrierId: item.carrierId,
                carrierName: item.carrierName,
                trailer: {
                  id: item.id,
                  plateNumber: item.plateNumber,
                  brandAndModel: item.brandAndModel,
                },
              })
            }
          />

          {selectedTractor ? (
            <>
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Гос. номер автомобиля
                </p>
                <p className="mt-1 font-semibold">{selectedTractor.plateNumber}</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Марка и модель авто
                </p>
                <p className="mt-1 font-semibold">{selectedTractor.brandAndModel}</p>
              </div>
            </>
          ) : null}

          {selectedTrailer ? (
            <>
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Номер прицепа
                </p>
                <p className="mt-1 font-semibold">{selectedTrailer.plateNumber}</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Марка и модель прицепа
                </p>
                <p className="mt-1 font-semibold">{selectedTrailer.brandAndModel}</p>
              </div>
            </>
          ) : null}

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-slate-700">
              Файл доверенности
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,application/pdf,image/jpeg,image/png"
                onChange={handleAttachmentChange}
                className="mt-1 block w-full text-sm text-slate-700 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
              />
            </label>
            <p className="mt-1 text-xs text-slate-500">
              PDF, JPG, PNG, DOC, DOCX до {formatFileSize(5 * 1024 * 1024)}
            </p>

            {attachment ? (
              <div className="mt-3 flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{attachment.fileName}</p>
                  <p className="text-xs text-slate-500">{formatFileSize(attachment.fileSize)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setAttachment(null)}
                  className="text-sm font-semibold text-rose-600 hover:text-rose-700"
                >
                  Удалить
                </button>
              </div>
            ) : null}

            {attachmentError ? (
              <p className="mt-2 text-sm text-rose-600">{attachmentError}</p>
            ) : null}
          </div>
        </div>

        {submitError ? <p className="mt-4 text-sm text-rose-600">{submitError}</p> : null}

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Отмена
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={!canSave || isSaving}
            className="rounded-lg border border-blue-600 bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving ? 'Сохранение...' : saveLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

export default PowerOfAttorneyModal
