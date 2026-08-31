import { useEffect, useMemo, useState } from 'react'
import type { Contract } from '../../dashboard'
import type { CreateRequestPayload } from '../model/types'
import { shipmentProductsByCategory } from '../model/shipmentProducts'

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

const nomenclatureByProduct = {
  mdf: shipmentProductsByCategory('mdf'),
  pogonazh: shipmentProductsByCategory('pogonazh'),
} satisfies Record<ProductType, string[]>

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
  const [packCount, setPackCount] = useState('')
  const [selectedLogistics, setSelectedLogistics] = useState<LogisticsType | null>(null)
  const [direction, setDirection] = useState('')
  const [shipmentDate, setShipmentDate] = useState('')
  const [submitError, setSubmitError] = useState('')

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
    setPackCount('')
    setSelectedLogistics(null)
    setDirection('')
    setShipmentDate('')
    setSubmitError('')
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
    setPackCount('')
  }

  const hasValidQuantity =
    selectedProduct === 'mdf'
      ? Number(packCount) > 0
      : selectedProduct === 'pogonazh'
        ? Number(volume) > 0
        : false

  const canGoToStep2 = selectedProduct !== null
  const canGoToStep3 = selectedNomenclature.trim().length > 0 && hasValidQuantity

  const canCreateRequest =
    (!hasMultipleLegalEntities || selectedRequestLegalEntity.trim().length > 0) &&
    selectedContractNumber.trim().length > 0 &&
    selectedLogistics !== null &&
    direction.trim().length > 0 &&
    shipmentDate.length > 0

  const canGoNext =
    (requestStep === legalEntityStep && selectedRequestLegalEntity.trim().length > 0) ||
    (requestStep === productStep && canGoToStep2) ||
    (requestStep === nomenclatureStep && canGoToStep3)

  const availableNomenclature = selectedProduct ? nomenclatureByProduct[selectedProduct] : []

  const submitCreateRequest = async () => {
    if (!canCreateRequest || !selectedProduct) {
      return
    }

    setSubmitError('')

    try {
      await onCreate({
        legalEntity: activeLegalEntity,
        productType: selectedProduct,
        nomenclature: selectedNomenclature,
        ...(selectedProduct === 'mdf'
          ? { packCount: packCount.trim() }
          : { volume: volume.trim() }),
        direction: direction.trim(),
        requestContract: selectedContractNumber,
      })

      onClose()
    } catch {
      setSubmitError('Не удалось создать заявку. Попробуйте еще раз.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto bg-white p-5 shadow-xl md:p-6">
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h3 className="text-xl font-bold text-slate-800">Создать заявку</h3>
            <p className="mt-1 text-sm text-slate-500">
              Шаг {requestStep} из {totalSteps}: {stepLabels[requestStep - 1]}
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

        <div className="mb-5 h-2 rounded-full bg-slate-100">
          <div
            className="h-2 rounded-full bg-blue-600 transition-all"
            style={{ width: `${(requestStep / totalSteps) * 100}%` }}
          />
        </div>

        {requestStep === legalEntityStep && hasMultipleLegalEntities && (
          <div>
            <p className="mb-3 text-sm font-semibold text-slate-700">1 шаг - Выбор юридического лица</p>
            <select
              value={selectedRequestLegalEntity}
              onChange={(event) => {
                setSelectedRequestLegalEntity(event.target.value)
                setSelectedContractNumber('')
              }}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-400"
            >
              <option value="">Выберите юридическое лицо</option>
              {legalEntities.map((entity) => (
                <option key={entity} value={entity}>
                  {entity}
                </option>
              ))}
            </select>
          </div>
        )}

        {requestStep === productStep && (
          <div>
            <p className="mb-3 text-sm font-semibold text-slate-700">
              {productStep} шаг - Выбор продукции
            </p>
            <div className="flex flex-col gap-2">
              {productOptions.map((product) => (
                <button
                  key={product.value}
                  type="button"
                  onClick={() => handleProductSelect(product.value)}
                  className={`w-full rounded-xl border px-4 py-3 text-left text-sm font-semibold ${
                    selectedProduct === product.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {product.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {requestStep === nomenclatureStep && (
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="mb-1 text-sm font-semibold text-slate-700">
                {nomenclatureStep} шаг - Выбор продукции для отгрузки
              </p>
              <select
                value={selectedNomenclature}
                onChange={(event) => setSelectedNomenclature(event.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-400"
              >
                <option value="">Выберите продукцию</option>
                {availableNomenclature.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <p className="mb-1 text-sm font-semibold text-slate-700">
                {selectedProduct === 'mdf' ? 'Количество пачек' : 'Объем'}
              </p>
              {selectedProduct === 'mdf' ? (
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={packCount}
                  onChange={(event) => setPackCount(event.target.value)}
                  placeholder="Введите количество пачек"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-blue-400"
                />
              ) : (
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={volume}
                  onChange={(event) => setVolume(event.target.value)}
                  placeholder="Введите объем"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-blue-400"
                />
              )}
            </div>
          </div>
        )}

        {requestStep === logisticsStep && (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <p className="mb-1 text-sm font-semibold text-slate-700">Договор</p>
              {hasMultipleLegalEntities && activeLegalEntity ? (
                <p className="mb-2 text-xs text-slate-500">
                  Договоры для {activeLegalEntity}
                </p>
              ) : null}
              <select
                value={selectedContractNumber}
                onChange={(event) => setSelectedContractNumber(event.target.value)}
                disabled={availableContracts.length === 0}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-400 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
              >
                <option value="">
                  {availableContracts.length === 0
                    ? 'Нет доступных договоров'
                    : 'Выберите договор'}
                </option>
                {availableContracts.map((contract) => (
                  <option key={contract.id} value={contract.id}>
                    {contract.id} · {contract.contractDate} · {contract.factualBalance}{' '}
                    {contract.contractCurrency}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <p className="mb-2 text-sm font-semibold text-slate-700">
                {logisticsStep} шаг - Выбор логистики
              </p>
              <div className="flex flex-col gap-2">
                {logisticsOptions.map((option) => (
                  <label
                    key={option.value}
                    className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700"
                  >
                    <input
                      type="radio"
                      name="logistics"
                      checked={selectedLogistics === option.value}
                      onChange={() => setSelectedLogistics(option.value)}
                      className="h-4 w-4 border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="mb-1 text-sm font-semibold text-slate-700">Адрес доставки</p>
                <input
                  type="text"
                  value={direction}
                  onChange={(event) => setDirection(event.target.value)}
                  placeholder="Например, Екатеринбург"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-blue-400"
                />
              </div>

              <div>
                <p className="mb-1 text-sm font-semibold text-slate-700">Желаемая дата отгрузки</p>
                <input
                  type="date"
                  value={shipmentDate}
                  onChange={(event) => setShipmentDate(event.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-400"
                />
              </div>
            </div>
          </div>
        )}

        {submitError ? <p className="mt-4 text-sm text-rose-600">{submitError}</p> : null}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setRequestStep((prevStep) => Math.max(prevStep - 1, 1))}
            disabled={requestStep === 1}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Назад
          </button>

          <div className="flex gap-2">
            {requestStep < totalSteps && (
              <button
                type="button"
                onClick={() => setRequestStep((prevStep) => prevStep + 1)}
                disabled={!canGoNext}
                className="rounded-lg border border-blue-600 bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                Далее
              </button>
            )}

            {requestStep === totalSteps && (
              <button
                type="button"
                onClick={submitCreateRequest}
                disabled={!canCreateRequest}
                className="rounded-lg border border-blue-600 bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                Создать
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateRequestModal
