import { http } from '../../../api/http'
import type { CreateRequestPayload, RequestRow, UpdatePowerOfAttorneyPayload } from './types'

type RequestsResponse = {
  requests: Array<RequestRow & { nomenclature?: string }>
}

const normalizeRequest = (request: RequestRow & { nomenclature?: string }): RequestRow => ({
  ...request,
  productKind: request.productKind ?? request.nomenclature ?? '—',
})

export const fetchRequests = async (legalEntities: string[]): Promise<RequestRow[]> => {
  const { data } = await http.get<RequestsResponse>('/api/requests', {
    params: {
      legalEntities: legalEntities.join(','),
    },
  })

  return data.requests.map(normalizeRequest)
}

export const createRequestOnServer = async (payload: CreateRequestPayload): Promise<RequestRow> => {
  const { data } = await http.post<RequestRow & { nomenclature?: string }>('/api/requests', payload)
  return normalizeRequest(data)
}

export const updatePowerOfAttorneyOnServer = async (
  requestId: string,
  payload: UpdatePowerOfAttorneyPayload,
): Promise<RequestRow> => {
  const { data } = await http.patch<RequestRow & { nomenclature?: string }>(
    `/api/requests/${requestId}/power-of-attorney`,
    payload,
  )
  return normalizeRequest(data)
}
