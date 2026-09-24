import { useEffect, useMemo, useRef, useState } from 'react'
import { RequestsDataTable, useRequests } from '../features/contracts'
import PowerOfAttorneyModal from '../features/contracts/ui/PowerOfAttorneyModal'
import ShipmentLinesTable from '../features/contracts/ui/ShipmentLinesTable'
import { ALL_REQUEST_STATUSES } from '../features/contracts/model/requestStatuses'
import { PRODUCT_KINDS } from '../features/contracts/model/shipmentProducts'
import { getShipmentLines, requestMatchesProductKind } from '../features/contracts/model/shipmentLines'
import type { RequestRow } from '../features/contracts/model/types'
import Select from '../components/ui/Select'
import DatePicker from '../components/ui/DatePicker'

// Дата в данных хранится строкой в формате "dd.MM.yyyy"
const parseRequestDate = (value: string): Date | null => {
  const match = value.match(/^(\d{2})\.(\d{2})\.(\d{4})$/)
  if (!match) {
    return null
  }

  return new Date(Number(match[3]), Number(match[2]) - 1, Number(match[1]))
}

// Значение из <input type="date"> приходит в формате "yyyy-mm-dd"
const parseIsoDate = (value: string): Date | null => {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!match) {
    return null
  }

  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
}

function RequestsPage() {
  const { requests, isLoading, error, updatePowerOfAttorney } = useRequests()
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedProductKind, setSelectedProductKind] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null)
  const [powerOfAttorneyRequest, setPowerOfAttorneyRequest] = useState<RequestRow | null>(null)
  const filtersButtonRef = useRef<HTMLButtonElement>(null)
  const filtersPanelRef = useRef<HTMLDivElement>(null)

  const openPowerOfAttorney = (request: RequestRow) => {
    setPowerOfAttorneyRequest(request)
  }

  const activeFiltersCount =
    (selectedDate ? 1 : 0) +
    (selectedProductKind !== 'all' ? 1 : 0) +
    (selectedStatus !== 'all' ? 1 : 0)

  const resetFilters = () => {
    setSelectedDate('')
    setSelectedProductKind('all')
    setSelectedStatus('all')
  }

  const productKinds = useMemo(
    () =>
      Array.from(
        new Set([...PRODUCT_KINDS, ...requests.map((request) => request.productKind)]),
      ),
    [requests],
  )

  const statuses = useMemo(() => {
    const fromRequests = Array.from(new Set(requests.map((request) => request.requestStatus)))
    return Array.from(new Set([...ALL_REQUEST_STATUSES, ...fromRequests]))
  }, [requests])

  const filteredRequests = useMemo(() => {
    const selectedDateValue = selectedDate ? parseIsoDate(selectedDate) : null

    return requests.filter((request) => {
      const matchesProductKind =
        selectedProductKind === 'all' || requestMatchesProductKind(request, selectedProductKind)

      const matchesStatus = selectedStatus === 'all' || request.requestStatus === selectedStatus

      const matchesDate = !selectedDateValue
        ? true
        : (() => {
            const requestDateValue = parseRequestDate(request.requestDate)
            if (!requestDateValue) {
              return false
            }

            return (
              requestDateValue.getFullYear() === selectedDateValue.getFullYear() &&
              requestDateValue.getMonth() === selectedDateValue.getMonth() &&
              requestDateValue.getDate() === selectedDateValue.getDate()
            )
          })()

      return matchesDate && matchesProductKind && matchesStatus
    })
  }, [requests, selectedDate, selectedProductKind, selectedStatus])

  const selectedRequest = useMemo(
    () => filteredRequests.find((request) => request.id === selectedRequestId) ?? null,
    [filteredRequests, selectedRequestId],
  )

  const handleOpenRequest = (request: RequestRow) => {
    setSelectedRequestId((currentId) => (currentId === request.id ? null : request.id))
  }

  useEffect(() => {
    if (!isFiltersOpen) {
      return
    }

    const closeOnOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (
        filtersButtonRef.current?.contains(target) ||
        filtersPanelRef.current?.contains(target) ||
        target.closest('[data-select-menu="true"]') ||
        target.closest('[data-date-picker="true"]')
      ) {
        return
      }

      setIsFiltersOpen(false)
    }

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsFiltersOpen(false)
      }
    }

    document.addEventListener('mousedown', closeOnOutside)
    document.addEventListener('keydown', closeOnEscape)

    return () => {
      document.removeEventListener('mousedown', closeOnOutside)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [isFiltersOpen])

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
        Загружаю заявки...
      </div>
    )
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 overflow-hidden">
      <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
        <div className="relative mb-4 shrink-0">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <h2 className="text-2xl font-bold text-slate-800">Заявки</h2>

            <div className="flex flex-wrap gap-2">
              <button
                ref={filtersButtonRef}
                type="button"
                onClick={() => setIsFiltersOpen((prevState) => !prevState)}
                className={`rounded-lg border px-4 py-2 text-sm font-semibold ${
                  isFiltersOpen || activeFiltersCount > 0
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                Фильтры {activeFiltersCount > 0 ? `(${activeFiltersCount})` : ''}
              </button>
            </div>
          </div>

          {isFiltersOpen ? (
            <div
              ref={filtersPanelRef}
              className="absolute right-0 top-full z-20 mt-2 w-full rounded-xl border border-slate-200 bg-white p-3 shadow-xl md:max-w-3xl"
            >
              <div className="grid gap-3 md:grid-cols-3">
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Дата
                  </p>
                  <DatePicker
                    value={selectedDate}
                    onChange={setSelectedDate}
                    placeholder="Все даты"
                    allowClear
                    className="rounded-lg px-3 py-2"
                  />
                </div>

                <div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Вид продукции
                  </p>
                  <Select
                    value={selectedProductKind}
                    onChange={setSelectedProductKind}
                    className="rounded-lg px-3 py-2"
                    options={[
                      { value: 'all', label: 'Все виды продукции' },
                      ...productKinds.map((productKind) => ({
                        value: productKind,
                        label: productKind,
                      })),
                    ]}
                  />
                </div>

                <div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Статус
                  </p>
                  <Select
                    value={selectedStatus}
                    onChange={setSelectedStatus}
                    className="rounded-lg px-3 py-2"
                    options={[
                      { value: 'all', label: 'Все статусы' },
                      ...statuses.map((status) => ({
                        value: status,
                        label: status,
                      })),
                    ]}
                  />
                </div>
              </div>

              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  onClick={resetFilters}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Сбросить
                </button>
              </div>
            </div>
          ) : null}
        </div>

        {error ? <p className="mb-3 shrink-0 text-sm text-rose-600">{error}</p> : null}

        <div className="min-h-0 flex-1 overflow-auto">
          <RequestsDataTable
            requests={filteredRequests}
            selectedRequestId={selectedRequestId}
            onOpenRequest={handleOpenRequest}
            onOpenPowerOfAttorney={openPowerOfAttorney}
          />
        </div>
      </section>

      <section
        className={`flex shrink-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:p-5 ${
          selectedRequest ? 'h-[17.5rem] md:h-[18.5rem]' : ''
        }`}
      >
        <div className="mb-3 flex shrink-0 items-center justify-between gap-3">
          <h3 className="text-lg font-bold text-slate-800">
            Отгружаемая продукция
            {selectedRequest ? (
              <span className="ml-2 text-sm font-semibold text-slate-500">
                · {selectedRequest.id}
              </span>
            ) : null}
          </h3>
          {selectedRequest ? (
            <button
              type="button"
              onClick={() => setSelectedRequestId(null)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Закрыть
            </button>
          ) : null}
        </div>

        <div className={`min-h-0 ${selectedRequest ? 'flex-1 overflow-hidden' : ''}`}>
          {selectedRequest ? (
            <ShipmentLinesTable lines={getShipmentLines(selectedRequest)} />
          ) : (
            <p className="text-sm text-slate-500">
              Выберите заявку, чтобы увидеть отгружаемую продукцию
            </p>
          )}
        </div>
      </section>

      <PowerOfAttorneyModal
        request={powerOfAttorneyRequest}
        isOpen={powerOfAttorneyRequest !== null}
        onSave={updatePowerOfAttorney}
        onClose={() => setPowerOfAttorneyRequest(null)}
      />
    </div>
  )
}

export default RequestsPage
