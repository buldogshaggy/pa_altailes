import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useAuth } from '../../auth'
import type { CreateRequestPayload, RequestRow, UpdatePowerOfAttorneyPayload } from './types'
import { createRequestOnServer, fetchRequests, updatePowerOfAttorneyOnServer } from './requestsApi'
import { REQUEST_STATUSES } from './requestStatuses'
import { DEMO_SHIPMENT_LINES } from './mockShipmentLines'
import { PRODUCT_KIND_LABELS } from './shipmentProducts'
import { SUPPLIERS } from './suppliers'

type RequestsContextValue = {
  requests: RequestRow[]
  isLoading: boolean
  error: string
  createRequest: (payload: CreateRequestPayload) => Promise<void>
  updatePowerOfAttorney: (requestId: string, payload: UpdatePowerOfAttorneyPayload) => Promise<void>
  getRequestsByContract: (contractNumber: string) => RequestRow[]
  getRequestsByLegalEntity: (legalEntity: string) => RequestRow[]
}

const RequestsContext = createContext<RequestsContextValue | undefined>(undefined)

const mockRequests: RequestRow[] = [
  {
    id: 'З-2026-0001',
    requestDate: '15.07.2026',
    requestStatus: REQUEST_STATUSES.completed,
    requestContract: 'К-2024-0001',
    legalEntity: 'ООО Альфа Логистик',
    supplier: SUPPLIERS[0],
    productKind: PRODUCT_KIND_LABELS.mdf,
    shipmentLines: DEMO_SHIPMENT_LINES.mdfMixed,
    direction: 'Екатеринбург',
  },
  {
    id: 'З-2026-0002',
    requestDate: '18.08.2026',
    requestStatus: REQUEST_STATUSES.approvedByManager,
    requestContract: 'К-2024-0001',
    legalEntity: 'ООО Альфа Логистик',
    supplier: SUPPLIERS[1],
    productKind: PRODUCT_KIND_LABELS.mdf,
    shipmentLines: DEMO_SHIPMENT_LINES.singleMdf16,
    direction: 'Тюмень',
  },
  {
    id: 'З-2026-0003',
    requestDate: '17.08.2026',
    requestStatus: REQUEST_STATUSES.pendingApproval,
    requestContract: 'К-2024-0001',
    legalEntity: 'ООО Альфа Логистик',
    supplier: SUPPLIERS[2],
    productKind: PRODUCT_KIND_LABELS.pogonazh,
    shipmentLines: DEMO_SHIPMENT_LINES.singleMolding,
    direction: 'Таджикистан',
  },
  {
    id: 'З-2026-0004',
    requestDate: '16.08.2026',
    requestStatus: REQUEST_STATUSES.inProgress,
    requestContract: 'К-2024-0001',
    legalEntity: 'ООО Альфа Логистик',
    supplier: SUPPLIERS[0],
    productKind: PRODUCT_KIND_LABELS.pogonazh,
    shipmentLines: DEMO_SHIPMENT_LINES.singlePlinth,
    direction: 'Екатеринбург',
  },
  {
    id: 'З-2026-0005',
    requestDate: '10.08.2026',
    requestStatus: REQUEST_STATUSES.powerOfAttorneyFilled,
    requestContract: 'К-2024-0001',
    legalEntity: 'ООО Альфа Логистик',
    supplier: SUPPLIERS[1],
    productKind: PRODUCT_KIND_LABELS.mdf,
    shipmentLines: DEMO_SHIPMENT_LINES.mdfPartial,
    powerOfAttorney: {
      driverFullName: 'Петров Пётр Петрович',
      driverPhoneNumber: '+7 (901) 234-56-78',
      deliveryAddress: 'Челябинск',
      carrierId: 'carrier-trans-ural',
      carrierName: 'ООО «Транс-Урал»',
      attachment: {
        fileName: 'доверенность-з-2026-0005.pdf',
        fileSize: 245_760,
        contentType: 'application/pdf',
        contentBase64: '',
      },
    },
    vehicleInfo: {
      tractorId: 'tractor-tu-1',
      trailerId: 'trailer-tu-1',
      carPlateNumber: 'А123ВС174',
      trailerPlateNumber: 'АВ1234 74',
      carBrandAndModel: 'Volvo FH16',
      trailerBrandAndModel: 'Schmitz Cargobull',
    },
    direction: 'Челябинск',
  },
  {
    id: 'З-2026-0006',
    requestDate: '05.08.2026',
    requestStatus: REQUEST_STATUSES.cancelled,
    requestContract: 'К-2024-0001',
    legalEntity: 'ООО Альфа Логистик',
    supplier: SUPPLIERS[2],
    productKind: PRODUCT_KIND_LABELS.pogonazh,
    shipmentLines: DEMO_SHIPMENT_LINES.singleJamb,
    direction: 'Москва',
  },
  {
    id: 'З-2026-0007',
    requestDate: '12.08.2026',
    requestStatus: REQUEST_STATUSES.inProgress,
    requestContract: 'К-2025-0001',
    legalEntity: 'ООО Куршавель',
    supplier: SUPPLIERS[0],
    productKind: PRODUCT_KIND_LABELS.mdf,
    shipmentLines: DEMO_SHIPMENT_LINES.singleMdf16,
    direction: 'Сочи',
  },
  {
    id: 'З-2026-0008',
    requestDate: '14.08.2026',
    requestStatus: REQUEST_STATUSES.approvedByManager,
    requestContract: 'К-2025-0001',
    legalEntity: 'ООО Куршавель',
    supplier: SUPPLIERS[1],
    productKind: PRODUCT_KIND_LABELS.mdf,
    shipmentLines: DEMO_SHIPMENT_LINES.singleMdf22,
    direction: 'Краснодар',
  },
  {
    id: 'З-2026-0009',
    requestDate: '11.08.2026',
    requestStatus: REQUEST_STATUSES.pendingApproval,
    requestContract: 'К-2026-0001',
    legalEntity: 'ООО Под Пальмой',
    supplier: SUPPLIERS[2],
    productKind: PRODUCT_KIND_LABELS.pogonazh,
    shipmentLines: DEMO_SHIPMENT_LINES.singlePlinth,
    direction: 'Анапа',
  },
  {
    id: 'З-2026-0010',
    requestDate: '09.08.2026',
    requestStatus: REQUEST_STATUSES.completed,
    requestContract: 'К-2027-0001',
    legalEntity: 'ООО Викинг',
    supplier: SUPPLIERS[0],
    productKind: PRODUCT_KIND_LABELS.pogonazh,
    shipmentLines: DEMO_SHIPMENT_LINES.singleJamb,
    direction: 'Мурманск',
  },
  {
    id: 'З-2026-0011',
    requestDate: '20.08.2026',
    requestStatus: REQUEST_STATUSES.approvedByManager,
    requestContract: 'К-2024-0001',
    legalEntity: 'ООО Альфа Логистик',
    supplier: SUPPLIERS[0],
    productKind: PRODUCT_KIND_LABELS.lumber,
    shipmentLines: DEMO_SHIPMENT_LINES.singleLumber,
    direction: 'Таджикистан',
  },
]

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)

const getNextRequestId = (requests: RequestRow[], date: Date) => {
  const year = date.getFullYear()
  const yearPrefix = `З-${year}-`

  const maxNumber = requests.reduce((maxValue, request) => {
    if (!request.id.startsWith(yearPrefix)) {
      return maxValue
    }

    const numericPart = Number(request.id.replace(yearPrefix, ''))

    if (Number.isNaN(numericPart)) {
      return maxValue
    }

    return Math.max(maxValue, numericPart)
  }, 0)

  return `${yearPrefix}${String(maxNumber + 1).padStart(4, '0')}`
}

type Props = {
  children: ReactNode
}

export function RequestsProvider({ children }: Props) {
  const { user } = useAuth()
  const legalEntities = user?.legalEntities
  const [requests, setRequests] = useState<RequestRow[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const loadRequests = useCallback(async () => {
    if (!legalEntities || legalEntities.length === 0) {
      setRequests([])
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const nextRequests = await fetchRequests(legalEntities)
      setRequests(nextRequests)
    } catch {
      const fallbackRequests = mockRequests.filter((request) =>
        legalEntities.includes(request.legalEntity),
      )
      setRequests(fallbackRequests)
      setError('Показаны демо-данные: API недоступен.')
    } finally {
      setIsLoading(false)
    }
  }, [legalEntities])

  useEffect(() => {
    void loadRequests()
  }, [loadRequests])

  const createRequest = useCallback(async (payload: CreateRequestPayload) => {
    setError('')

    const vehicleCount =
      payload.productType === 'mdf' ? Math.max(1, Math.floor(payload.vehicleCount ?? 1)) : 1

    const buildShipmentLines = (supplier: string) => {
      if (payload.productType === 'mdf' && payload.items && payload.items.length > 0) {
        return payload.items.map((item, index) => ({
          lineNumber: index + 1,
          warehouse: supplier,
          nomenclature: item.nomenclature,
          quantity: String(item.packCount),
          shipped: '0',
          price: '—',
          amount: '—',
        }))
      }

      return [
        {
          lineNumber: 1,
          warehouse: supplier,
          nomenclature: payload.nomenclature ?? '—',
          quantity: payload.volume ?? '0',
          shipped: '0',
          price: '—',
          amount: '—',
        },
      ]
    }

    try {
      const createdRequests: RequestRow[] = []

      for (let index = 0; index < vehicleCount; index += 1) {
        createdRequests.push(await createRequestOnServer(payload))
      }

      setRequests((prevRequests) => [...createdRequests, ...prevRequests])
    } catch {
      const now = new Date()
      const supplier = payload.supplier ?? SUPPLIERS[0]
      const shipmentLines = buildShipmentLines(supplier)

      setRequests((prevRequests) => {
        const localRequests: RequestRow[] = []
        let nextRequests = prevRequests

        for (let index = 0; index < vehicleCount; index += 1) {
          const localRequest: RequestRow = {
            id: getNextRequestId(nextRequests, now),
            requestDate: formatDate(now),
            requestStatus: REQUEST_STATUSES.new,
            requestContract: payload.requestContract,
            legalEntity: payload.legalEntity,
            supplier,
            productKind: PRODUCT_KIND_LABELS[payload.productType],
            shipmentLines,
            direction: payload.direction,
          }

          localRequests.push(localRequest)
          nextRequests = [localRequest, ...nextRequests]
        }

        return nextRequests
      })
      setError(
        vehicleCount > 1
          ? `API недоступен: создано ${vehicleCount} одинаковых заявок локально (демо-режим).`
          : 'API недоступен: заявка сохранена локально (демо-режим).',
      )
    }
  }, [])

  const updatePowerOfAttorney = useCallback(async (requestId: string, payload: UpdatePowerOfAttorneyPayload) => {
    setError('')

    try {
      const updatedRequest = await updatePowerOfAttorneyOnServer(requestId, payload)
      setRequests((prevRequests) =>
        prevRequests.map((request) => (request.id === requestId ? updatedRequest : request)),
      )
    } catch {
      const {
        vehicleInfo,
        driverFullName,
        driverPhoneNumber,
        deliveryAddress,
        borderCrossing,
        carrierId,
        carrierName,
        attachment,
      } = payload

      setRequests((prevRequests) =>
        prevRequests.map((request) =>
          request.id === requestId
            ? {
                ...request,
                direction: deliveryAddress,
                powerOfAttorney: {
                  driverFullName,
                  driverPhoneNumber,
                  deliveryAddress,
                  borderCrossing,
                  carrierId,
                  carrierName,
                  attachment,
                },
                vehicleInfo,
                requestStatus: REQUEST_STATUSES.powerOfAttorneyFilled,
              }
            : request,
        ),
      )
      setError('API недоступен: доверенность сохранена локально (демо-режим).')
    }
  }, [])

  const getRequestsByContract = (contractNumber: string) =>
    requests.filter((request) => request.requestContract === contractNumber)

  const getRequestsByLegalEntity = (legalEntity: string) =>
    requests.filter((request) => request.legalEntity === legalEntity)

  const contextValue = useMemo(
    () => ({
      requests,
      isLoading,
      error,
      createRequest,
      updatePowerOfAttorney,
      getRequestsByContract,
      getRequestsByLegalEntity,
    }),
    [requests, isLoading, error, createRequest, updatePowerOfAttorney],
  )

  return <RequestsContext.Provider value={contextValue}>{children}</RequestsContext.Provider>
}

export function useRequests() {
  const context = useContext(RequestsContext)

  if (!context) {
    throw new Error('useRequests must be used within RequestsProvider')
  }

  return context
}

// Хук для личного кабинета: заявки конкретного контрагента по конкретному договору.
// Проверяет, что договор действительно принадлежит этому контрагенту —
// иначе один контрагент мог бы подставить чужой номер договора и увидеть чужие заявки.
export function useContractRequests(legalEntity: string, contractNumber: string) {
  const { requests } = useRequests()

  return useMemo(
    () =>
      requests.filter(
        (request) =>
          request.legalEntity === legalEntity && request.requestContract === contractNumber,
      ),
    [requests, legalEntity, contractNumber],
  )
}