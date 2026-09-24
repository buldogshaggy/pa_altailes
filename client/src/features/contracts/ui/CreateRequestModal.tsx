import { useEffect, useMemo, useState } from 'react'
import type { Contract } from '../../dashboard'
import { formatPhoneMask, isValidRussianPhone } from '../model/phoneMask'
import type { CreateRequestItem, CreateRequestPayload } from '../model/types'
import {
  MDF_BOARD_TYPES,
  MDF_FORMATS_BY_TYPE,
  MDF_PACKS_PER_VEHICLE,
  MDF_SIDES,
  MDF_THICKNESSES_MM,
  formatMdfNomenclature,
  shipmentProductsByCategory,
  type MdfBoardType,
  type MdfSide,
} from '../model/shipmentProducts'
import TruckLoadScheme from './TruckLoadScheme'
import Select from '../../../components/ui/Select'
import DatePicker from '../../../components/ui/DatePicker'

const productOptions = [
  { value: 'mdf', label: 'Плиты MDF' },
  { value: 'pogonazh', label: 'Погонаж' },
] as const

const logisticsOptions = [
  { value: 'pickup', label: 'Самовывоз' },
  { value: 'delivery', label: 'Доставка' },
] as const

type ProductType = (typeof productOptions)[number]['value']
type LogisticsType = (typeof logisticsOptions)[number]['value']

type MdfLineDraft = {
  id: string
  boardType: MdfBoardType | ''
  format: string
  side: MdfSide | ''
  thicknessMm: string
  packCount: string
}

const nomenclatureByProduct = {
  mdf: shipmentProductsByCategory('mdf'),
  pogonazh: shipmentProductsByCategory('pogonazh'),
} satisfies Record<ProductType, string[]>

const createEmptyMdfLine = (): MdfLineDraft => ({
  id: crypto.randomUUID(),
  boardType: '',
  format: '',
  side: '',
  thicknessMm: '',
  packCount: '',
})

const isMdfLineProductComplete = (line: MdfLineDraft): boolean =>
  Boolean(line.boardType && line.format && line.side && line.thicknessMm)

const fieldInputClass =
  'w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-blue-400 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400'
const fieldLabelClass = 'mb-0.5 block text-xs font-medium text-slate-500'
const fieldErrorClass =
  'pointer-events-none absolute left-0 top-full z-10 mt-0.5 text-[11px] leading-tight text-rose-600'

type Props = {
  isOpen: boolean
  contracts: Contract[]
  onCreate: (payload: CreateRequestPayload) => Promise<void>
  onClose: () => void
}

function CreateRequestModal({ isOpen, contracts, onCreate, onClose }: Props) {
  const legalEntities = useMemo(
    () => Array.from(new Set(contracts.map((contract) => contract.legalEntity))),
    [contracts],
  )
  const hasMultipleLegalEntities = legalEntities.length > 1
  const stepLabels = hasMultipleLegalEntities
    ? ['Выбор юридического лица', 'Выбор продукции', 'Продукция и количество', 'Логистика и дата']
    : ['Выбор продукции', 'Продукция и количество', 'Логистика и дата']

  const totalSteps = stepLabels.length
  const legalEntityStep = hasMultipleLegalEntities ? 1 : 0
  const productStep = hasMultipleLegalEntities ? 2 : 1
  const nomenclatureStep = hasMultipleLegalEntities ? 3 : 2
  const logisticsStep = hasMultipleLegalEntities ? 4 : 3

  const [requestStep, setRequestStep] = useState(1)
  const [selectedRequestLegalEntity, setSelectedRequestLegalEntity] = useState('')
  const [selectedContractNumber, setSelectedContractNumber] = useState('')
  const [selectedProduct, setSelectedProduct] = useState<ProductType | null>(null)
  const [selectedNomenclature, setSelectedNomenclature] = useState('')
  const [volume, setVolume] = useState('')
  const [mdfLines, setMdfLines] = useState<MdfLineDraft[]>([createEmptyMdfLine()])
  const [vehicleCount, setVehicleCount] = useState('1')
  const [selectedLogistics, setSelectedLogistics] = useState<LogisticsType | null>(null)
  const [contactPhone, setContactPhone] = useState('')
  const [contactFullName, setContactFullName] = useState('')
  const [phoneTouched, setPhoneTouched] = useState(false)
  const [direction, setDirection] = useState('')
  const [shipmentDate, setShipmentDate] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const activeLegalEntity = hasMultipleLegalEntities
    ? selectedRequestLegalEntity
    : (legalEntities[0] ?? '')

  const availableContracts = useMemo(
    () =>
      contracts.filter((contract) =>
        activeLegalEntity ? contract.legalEntity === activeLegalEntity : true,
      ),
    [contracts, activeLegalEntity],
  )

  const resetCreateRequestForm = () => {
    setRequestStep(1)
    setSelectedRequestLegalEntity(hasMultipleLegalEntities ? '' : (legalEntities[0] ?? ''))
    setSelectedContractNumber('')
    setSelectedProduct(null)
    setSelectedNomenclature('')
    setVolume('')
    setMdfLines([createEmptyMdfLine()])
    setVehicleCount('1')
    setSelectedLogistics(null)
    setContactPhone('')
    setContactFullName('')
    setPhoneTouched(false)
    setDirection('')
    setShipmentDate('')
    setSubmitError('')
    setIsSubmitting(false)
  }

  useEffect(() => {
    if (!isOpen) {
      return
    }

    resetCreateRequestForm()
  }, [isOpen])

  useEffect(() => {
    if (availableContracts.length === 0) {
      setSelectedContractNumber('')
      return
    }

    const selectedStillAvailable = availableContracts.some(
      (contract) => contract.id === selectedContractNumber,
    )

    if (!selectedStillAvailable) {
      setSelectedContractNumber('')
    }
  }, [availableContracts, selectedContractNumber])

  useEffect(() => {
    setSelectedContractNumber('')
  }, [selectedRequestLegalEntity])

  if (!isOpen) {
    return null
  }

  const handleProductSelect = (product: ProductType) => {
    setSelectedProduct(product)
    setSelectedNomenclature('')
    setVolume('')
    setMdfLines([createEmptyMdfLine()])
    setVehicleCount('1')
  }

  const mdfItems: CreateRequestItem[] = mdfLines
    .map((line) => ({
      nomenclature: formatMdfNomenclature(line),
      packCount: Number(line.packCount),
    }))
    .filter((item) => item.nomenclature.length > 0 && Number.isFinite(item.packCount) && item.packCount > 0)

  const totalMdfPacks = mdfItems.reduce((sum, item) => sum + item.packCount, 0)
  const parsedVehicleCount = Number(vehicleCount)
  const hasValidVehicleCount =
    Number.isInteger(parsedVehicleCount) && parsedVehicleCount >= 1

  const hasDuplicateMdfNomenclature =
    new Set(mdfItems.map((item) => item.nomenclature)).size !== mdfItems.length

  const hasValidMdfLines =
    mdfItems.length > 0 &&
    mdfLines.every((line) => {
      const packs = Number(line.packCount)
      return formatMdfNomenclature(line).length > 0 && Number.isInteger(packs) && packs > 0
    }) &&
    totalMdfPacks === MDF_PACKS_PER_VEHICLE &&
    !hasDuplicateMdfNomenclature &&
    hasValidVehicleCount

  const hasValidPogonazh =
    selectedNomenclature.trim().length > 0 && Number(volume) > 0

  const canGoToStep2 = selectedProduct !== null
  const canGoToStep3 =
    selectedProduct === 'mdf'
      ? hasValidMdfLines
      : selectedProduct === 'pogonazh'
        ? hasValidPogonazh
        : false

  const hasValidDeliveryContact =
    selectedLogistics !== 'delivery' ||
    (isValidRussianPhone(contactPhone) && contactFullName.trim().length > 0)

  const canCreateRequest =
    (!hasMultipleLegalEntities || selectedRequestLegalEntity.trim().length > 0) &&
    selectedContractNumber.trim().length > 0 &&
    selectedLogistics !== null &&
    hasValidDeliveryContact &&
    direction.trim().length > 0 &&
    shipmentDate.length > 0

  const canGoNext =
    (requestStep === legalEntityStep && selectedRequestLegalEntity.trim().length > 0) ||
    (requestStep === productStep && canGoToStep2) ||
    (requestStep === nomenclatureStep && canGoToStep3)

  const availableNomenclature = selectedProduct ? nomenclatureByProduct[selectedProduct] : []

  const updateMdfLine = (lineId: string, patch: Partial<Omit<MdfLineDraft, 'id'>>) => {
    setMdfLines((prevLines) =>
      prevLines.map((line) => {
        if (line.id !== lineId) {
          return line
        }

        const nextLine = { ...line, ...patch }
        if (!isMdfLineProductComplete(nextLine)) {
          nextLine.packCount = ''
        }

        return nextLine
      }),
    )
  }

  const addMdfLine = () => {
    setMdfLines((prevLines) => [...prevLines, createEmptyMdfLine()])
  }

  const removeMdfLine = (lineId: string) => {
    setMdfLines((prevLines) =>
      prevLines.length <= 1 ? prevLines : prevLines.filter((line) => line.id !== lineId),
    )
  }

  const packsHintClass =
    totalMdfPacks === MDF_PACKS_PER_VEHICLE
      ? 'text-emerald-700'
      : totalMdfPacks > MDF_PACKS_PER_VEHICLE
        ? 'text-rose-600'
        : 'text-slate-600'

  const submitCreateRequest = async () => {
    if (!canCreateRequest || !selectedProduct) {
      return
    }

    setSubmitError('')
    setIsSubmitting(true)

    try {
      const logisticsFields = {
        direction: direction.trim(),
        requestContract: selectedContractNumber,
        logisticsType: selectedLogistics ?? undefined,
        contactPhone: selectedLogistics === 'delivery' ? contactPhone : undefined,
        contactFullName: selectedLogistics === 'delivery' ? contactFullName.trim() : undefined,
      }

      if (selectedProduct === 'mdf') {
        await onCreate({
          legalEntity: activeLegalEntity,
          productType: 'mdf',
          items: mdfItems,
          vehicleCount: parsedVehicleCount,
          ...logisticsFields,
        })
      } else {
        await onCreate({
          legalEntity: activeLegalEntity,
          productType: 'pogonazh',
          nomenclature: selectedNomenclature,
          volume: volume.trim(),
          ...logisticsFields,
        })
      }

      onClose()
    } catch {
      setSubmitError('Не удалось создать заявку. Попробуйте еще раз.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-3">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="shrink-0 border-b border-slate-100 px-4 py-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Создать заявку</h3>
              <p className="mt-0.5 text-xs text-slate-500">
                Шаг {requestStep} из {totalSteps}: {stepLabels[requestStep - 1]}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Закрыть модальное окно"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-300 text-lg leading-none text-slate-600 hover:bg-slate-50"
            >
              ×
            </button>
          </div>

          <div className="mt-2.5 h-1.5 rounded-full bg-slate-100">
            <div
              className="h-1.5 rounded-full bg-blue-600 transition-all"
              style={{ width: `${(requestStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        <div className="modal-scrollbar min-h-0 flex-1 overflow-y-auto px-4 py-3">

        {requestStep === legalEntityStep && hasMultipleLegalEntities && (
          <div>
            <p className={fieldLabelClass}>Юридическое лицо</p>
            <Select
              value={selectedRequestLegalEntity}
              onChange={(nextValue) => {
                setSelectedRequestLegalEntity(nextValue)
                setSelectedContractNumber('')
              }}
              options={[
                { value: '', label: 'Выберите юридическое лицо' },
                ...legalEntities.map((entity) => ({ value: entity, label: entity })),
              ]}
            />
          </div>
        )}

        {requestStep === productStep && (
          <div className="flex gap-2">
            {productOptions.map((product) => (
              <button
                key={product.value}
                type="button"
                onClick={() => handleProductSelect(product.value)}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm font-semibold ${
                  selectedProduct === product.value
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                {product.label}
              </button>
            ))}
          </div>
        )}

        {requestStep === nomenclatureStep && selectedProduct === 'mdf' && (
          <div className="space-y-3">
            <p className="text-xs text-slate-500">
              1 машина = {MDF_PACKS_PER_VEHICLE} пачек. Можно добавить несколько позиций.
            </p>

            <div className="space-y-2">
              {mdfLines.map((line, index) => {
                const formatOptions = line.boardType ? MDF_FORMATS_BY_TYPE[line.boardType] : []
                const canEditPackCount = isMdfLineProductComplete(line)

                return (
                  <div
                    key={line.id}
                    className="space-y-2 rounded-lg border border-slate-200 bg-slate-50/80 p-2.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold text-slate-500">Позиция {index + 1}</p>
                      <button
                        type="button"
                        onClick={() => removeMdfLine(line.id)}
                        disabled={mdfLines.length <= 1}
                        className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Удалить
                      </button>
                    </div>

                    <div className="grid gap-2 md:grid-cols-2">
                      <div className="md:col-span-2">
                        <p className={fieldLabelClass}>Вид плиты</p>
                        <Select
                          value={line.boardType}
                          onChange={(nextValue) =>
                            updateMdfLine(line.id, {
                              boardType: nextValue as MdfBoardType | '',
                              format: '',
                            })
                          }
                          options={[
                            { value: '', label: 'Выберите вид плиты' },
                            ...MDF_BOARD_TYPES.map((type) => ({
                              value: type.value,
                              label: type.label,
                            })),
                          ]}
                        />
                      </div>

                      <div>
                        <p className={fieldLabelClass}>Формат, мм</p>
                        <Select
                          value={line.format}
                          onChange={(nextValue) => updateMdfLine(line.id, { format: nextValue })}
                          disabled={!line.boardType}
                          options={[
                            {
                              value: '',
                              label: line.boardType ? 'Выберите формат' : 'Сначала вид плиты',
                            },
                            ...formatOptions.map((format) => ({ value: format, label: format })),
                          ]}
                        />
                      </div>

                      <div>
                        <p className={fieldLabelClass}>Стороны</p>
                        <Select
                          value={line.side}
                          onChange={(nextValue) =>
                            updateMdfLine(line.id, { side: nextValue as MdfSide | '' })
                          }
                          options={[
                            { value: '', label: 'Односторонняя / двухсторонняя' },
                            ...MDF_SIDES.map((side) => ({
                              value: side.value,
                              label: side.label,
                            })),
                          ]}
                        />
                      </div>

                      <div>
                        <p className={fieldLabelClass}>Толщина</p>
                        <Select
                          value={line.thicknessMm}
                          onChange={(nextValue) =>
                            updateMdfLine(line.id, { thicknessMm: nextValue })
                          }
                          options={[
                            { value: '', label: 'Выберите толщину' },
                            ...MDF_THICKNESSES_MM.map((thickness) => ({
                              value: String(thickness),
                              label: `${thickness} мм`,
                            })),
                          ]}
                        />
                      </div>

                      <div>
                        <p className={fieldLabelClass}>Пачек</p>
                        <input
                          type="number"
                          min="1"
                          step="1"
                          value={line.packCount}
                          onChange={(event) =>
                            updateMdfLine(line.id, { packCount: event.target.value })
                          }
                          disabled={!canEditPackCount}
                          placeholder={canEditPackCount ? '0' : 'Сначала продукция'}
                          className={fieldInputClass}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="relative">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={addMdfLine}
                  className="rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  + Позиция
                </button>

                <p className={`ml-auto text-xs font-semibold ${packsHintClass}`}>
                  {totalMdfPacks}/{MDF_PACKS_PER_VEHICLE} пачек
                </p>
              </div>

              {hasDuplicateMdfNomenclature ||
              (totalMdfPacks > 0 && totalMdfPacks !== MDF_PACKS_PER_VEHICLE) ? (
                <p className={fieldErrorClass}>
                  {hasDuplicateMdfNomenclature
                    ? 'Одна и та же номенклатура выбрана несколько раз — объедините пачки в одну позицию.'
                    : `Нужно ровно ${MDF_PACKS_PER_VEHICLE} пачек на одну машину.`}
                </p>
              ) : null}
            </div>

            <TruckLoadScheme items={mdfItems} totalPacks={totalMdfPacks} />

            <label className="flex items-center gap-2 text-xs font-medium text-slate-600">
              Количество машин
              <input
                type="number"
                min="1"
                step="1"
                value={vehicleCount}
                onChange={(event) => setVehicleCount(event.target.value)}
                className="w-20 rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-slate-700 outline-none focus:border-blue-400"
              />
              <span className="text-slate-400">
                {hasValidVehicleCount ? 'по одной заявке на машину' : ''}
              </span>
            </label>
          </div>
        )}

        {requestStep === nomenclatureStep && selectedProduct === 'pogonazh' && (
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <p className={fieldLabelClass}>Продукция для отгрузки</p>
              <Select
                value={selectedNomenclature}
                onChange={setSelectedNomenclature}
                options={[
                  { value: '', label: 'Выберите продукцию' },
                  ...availableNomenclature.map((item) => ({ value: item, label: item })),
                ]}
              />
            </div>

            <div>
              <p className={fieldLabelClass}>Объем</p>
              <input
                type="number"
                min="0"
                step="1"
                value={volume}
                onChange={(event) => setVolume(event.target.value)}
                placeholder="Введите объем"
                className={fieldInputClass}
              />
            </div>
          </div>
        )}

        {requestStep === logisticsStep && (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <p className={fieldLabelClass}>Договор</p>
              {hasMultipleLegalEntities && activeLegalEntity ? (
                <p className="mb-1 text-[11px] text-slate-500">Договоры для {activeLegalEntity}</p>
              ) : null}
              <Select
                value={selectedContractNumber}
                onChange={setSelectedContractNumber}
                disabled={availableContracts.length === 0}
                options={[
                  {
                    value: '',
                    label:
                      availableContracts.length === 0
                        ? 'Нет доступных договоров'
                        : 'Выберите договор',
                  },
                  ...availableContracts.map((contract) => ({
                    value: contract.id,
                    label: `${contract.id} · ${contract.contractDate} · ${contract.factualBalance} ${contract.contractCurrency}`,
                  })),
                ]}
              />
            </div>

            <div className="md:col-span-2">
              <p className={fieldLabelClass}>Логистика</p>
              <div className="flex gap-4">
                {logisticsOptions.map((option) => (
                  <label
                    key={option.value}
                    className={`inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-md border px-3 py-1.5 text-sm ${
                      selectedLogistics === option.value
                        ? 'border-blue-500 bg-blue-50 font-semibold text-blue-700'
                        : 'border-slate-300 bg-white text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="logistics"
                      checked={selectedLogistics === option.value}
                      onChange={() => {
                        setSelectedLogistics(option.value)
                        setPhoneTouched(false)
                        if (option.value !== 'delivery') {
                          setContactPhone('')
                          setContactFullName('')
                        }
                      }}
                      className="h-4 w-4 border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            </div>

            {selectedLogistics === 'delivery' ? (
              <>
                <div>
                  <p className={fieldLabelClass}>ФИО контакта</p>
                  <input
                    type="text"
                    autoComplete="name"
                    value={contactFullName}
                    onChange={(event) => setContactFullName(event.target.value)}
                    placeholder="Иванов Иван Иванович"
                    className={fieldInputClass}
                  />
                </div>

                <div className="relative">
                  <p className={fieldLabelClass}>Контактный телефон</p>
                  <input
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    value={contactPhone}
                    onChange={(event) =>
                      setContactPhone(formatPhoneMask(event.target.value, contactPhone))
                    }
                    onBlur={() => setPhoneTouched(true)}
                    placeholder="+7 (999) 123-45-67"
                    className={`${fieldInputClass} ${
                      phoneTouched && !isValidRussianPhone(contactPhone) ? 'border-rose-400' : ''
                    }`}
                  />
                  {phoneTouched && !isValidRussianPhone(contactPhone) ? (
                    <p className={fieldErrorClass}>Формат: +7 (XXX) XXX-XX-XX</p>
                  ) : null}
                </div>
              </>
            ) : null}

            <div>
              <p className={fieldLabelClass}>Адрес доставки</p>
              <input
                type="text"
                value={direction}
                onChange={(event) => setDirection(event.target.value)}
                placeholder="Например, Екатеринбург"
                className={fieldInputClass}
              />
            </div>

            <div>
              <p className={fieldLabelClass}>Желаемая дата отгрузки</p>
              <DatePicker
                value={shipmentDate}
                onChange={setShipmentDate}
                placeholder="Выберите дату"
              />
            </div>

            {selectedProduct === 'mdf' && hasValidVehicleCount && parsedVehicleCount > 1 ? (
              <p className="md:col-span-2 rounded-md border border-blue-100 bg-blue-50 px-2.5 py-1.5 text-xs text-blue-800">
                Будет создано {parsedVehicleCount} одинаковых заявки по {MDF_PACKS_PER_VEHICLE} пачек
                (по одной на машину).
              </p>
            ) : null}
          </div>
        )}
        </div>

        <div className="relative shrink-0 border-t border-slate-100 px-4 py-3">
          {submitError ? (
            <p className="pointer-events-none absolute inset-x-4 bottom-full z-10 mb-1 text-xs text-rose-600">
              {submitError}
            </p>
          ) : null}

          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setRequestStep((prevStep) => Math.max(prevStep - 1, 1))}
              disabled={requestStep === 1 || isSubmitting}
              className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Назад
            </button>

            <div className="flex gap-2">
              {requestStep < totalSteps && (
                <button
                  type="button"
                  onClick={() => setRequestStep((prevStep) => prevStep + 1)}
                  disabled={!canGoNext}
                  className="rounded-md border border-blue-600 bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Далее
                </button>
              )}

              {requestStep === totalSteps && (
                <button
                  type="button"
                  onClick={submitCreateRequest}
                  disabled={!canCreateRequest || isSubmitting}
                  className="rounded-md border border-blue-600 bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSubmitting
                    ? 'Создание...'
                    : selectedProduct === 'mdf' && hasValidVehicleCount && parsedVehicleCount > 1
                      ? `Создать ${parsedVehicleCount} заявки`
                      : 'Создать'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateRequestModal

