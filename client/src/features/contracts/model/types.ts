import type { RequestStatus } from './requestStatuses'
import type { Supplier } from './suppliers'

export type ShipmentLine = {
  lineNumber: number
  warehouse: string
  nomenclature: string
  quantity: string
  shipped: string
  price: string
  amount: string
}

export type RequestRow = {
  id: string
  requestDate: string
  requestStatus: RequestStatus | string
  requestContract: string
  productKind: string
  shipmentLines?: ShipmentLine[]
  legalEntity: string
  supplier: Supplier | string
  direction: string
  powerOfAttorney?: PowerOfAttorneyDetails
  vehicleInfo?: VehicleInfo
}

export type CreateRequestPayload = {
  legalEntity: string
  productType: 'mdf' | 'pogonazh'
  nomenclature: string
  volume?: string
  packCount?: string
  requestContract: string
  direction: string
  supplier?: Supplier | string
}

export type PowerOfAttorneyAttachment = {
  fileName: string
  fileSize: number
  contentType: string
  contentBase64: string
}

export type PowerOfAttorneyDetails = {
  driverFullName: string
  driverPhoneNumber: string
  deliveryAddress: string
  /** Только для заявок по пиломатериалам */
  borderCrossing?: string
  carrierId: string
  carrierName: string
  attachment?: PowerOfAttorneyAttachment
}

export type CarrierTractor = {
  id: string
  plateNumber: string
  brandAndModel: string
}

export type CarrierTrailer = {
  id: string
  plateNumber: string
  brandAndModel: string
}

export type Carrier = {
  id: string
  name: string
  tractors: CarrierTractor[]
  trailers: CarrierTrailer[]
}

export type VehicleInfo = {
  tractorId: string
  trailerId: string
  carPlateNumber: string
  trailerPlateNumber: string
  carBrandAndModel: string
  trailerBrandAndModel: string
}

export type UpdatePowerOfAttorneyPayload = PowerOfAttorneyDetails & {
  vehicleInfo: VehicleInfo
}
