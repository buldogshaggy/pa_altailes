import type { RequestRow, ShipmentLine } from './types'
import { PRODUCT_KIND_LABELS } from './shipmentProducts'

export function getShipmentLines(
  request: Pick<RequestRow, 'shipmentLines' | 'productKind'>,
): ShipmentLine[] {
  if (request.shipmentLines && request.shipmentLines.length > 0) {
    return request.shipmentLines
  }

  return []
}

export function getRequestProductKind(request: Pick<RequestRow, 'productKind'>): string {
  return request.productKind || '—'
}

export function requestMatchesProductKind(
  request: Pick<RequestRow, 'productKind'>,
  productKind: string,
): boolean {
  return request.productKind === productKind
}

export function isLumberRequest(request: Pick<RequestRow, 'productKind'>): boolean {
  return request.productKind === PRODUCT_KIND_LABELS.lumber
}
