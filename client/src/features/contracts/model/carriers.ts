import type { Carrier, CarrierTractor, CarrierTrailer } from './types'

/** Демо-справочник. Позже список будет приходить из 1С. */
export const MOCK_CARRIERS: Carrier[] = [
  {
    id: 'carrier-trans-ural',
    name: 'ООО «Транс-Урал»',
    tractors: [
      { id: 'tractor-tu-1', plateNumber: 'А123ВС174', brandAndModel: 'Volvo FH16' },
      { id: 'tractor-tu-2', plateNumber: 'К456МН174', brandAndModel: 'Scania R450' },
      { id: 'tractor-tu-3', plateNumber: 'О789ОР174', brandAndModel: 'MAN TGX' },
    ],
    trailers: [
      { id: 'trailer-tu-1', plateNumber: 'АВ1234 74', brandAndModel: 'Schmitz Cargobull' },
      { id: 'trailer-tu-2', plateNumber: 'ВЕ5678 74', brandAndModel: 'Krone SD' },
      { id: 'trailer-tu-3', plateNumber: 'АК9012 74', brandAndModel: 'Kögel Cargo' },
    ],
  },
  {
    id: 'carrier-sib-logistik',
    name: 'АО «СибЛогистик»',
    tractors: [
      { id: 'tractor-sl-1', plateNumber: 'В111АА54', brandAndModel: 'Mercedes-Benz Actros' },
      { id: 'tractor-sl-2', plateNumber: 'Е222ВВ54', brandAndModel: 'DAF XF' },
    ],
    trailers: [
      { id: 'trailer-sl-1', plateNumber: 'АА1111 54', brandAndModel: 'Schmitz Cargobull' },
      { id: 'trailer-sl-2', plateNumber: 'ВВ2222 54', brandAndModel: 'Schwarzmüller' },
    ],
  },
  {
    id: 'carrier-altai-auto',
    name: 'ИП Смирнов А.В.',
    tractors: [
      { id: 'tractor-aa-1', plateNumber: 'М333КК22', brandAndModel: 'КАМАЗ 5490' },
      { id: 'tractor-aa-2', plateNumber: 'Н444НН22', brandAndModel: 'МАЗ 5440' },
      { id: 'tractor-aa-3', plateNumber: 'Р555РР22', brandAndModel: 'Volvo FH' },
    ],
    trailers: [
      { id: 'trailer-aa-1', plateNumber: 'КК3333 22', brandAndModel: 'Нефаз 9334' },
      { id: 'trailer-aa-2', plateNumber: 'НН4444 22', brandAndModel: 'Тонар 9746' },
      { id: 'trailer-aa-3', plateNumber: 'РР5555 22', brandAndModel: 'Schmitz S.KO' },
    ],
  },
]

export type CarrierTractorMatch = {
  carrierId: string
  carrierName: string
  tractor: CarrierTractor
}

export type CarrierTrailerMatch = {
  carrierId: string
  carrierName: string
  trailer: CarrierTrailer
}

export function normalizePlate(value: string): string {
  return value.replace(/[\s-]/g, '').toUpperCase()
}

export function findCarrierById(carrierId: string | undefined): Carrier | undefined {
  if (!carrierId) {
    return undefined
  }

  return MOCK_CARRIERS.find((carrier) => carrier.id === carrierId)
}

function matchesPlateQuery(plateNumber: string, plateQuery: string): boolean {
  const query = normalizePlate(plateQuery)
  if (!query) {
    return true
  }

  return normalizePlate(plateNumber).includes(query)
}

/** Поиск голов: при пустом запросе — пул выбранного перевозчика (или все); при вводе — по всем. */
export function searchTractors(
  plateQuery: string,
  preferredCarrierId?: string,
): CarrierTractorMatch[] {
  const query = normalizePlate(plateQuery)
  const carriers =
    !query && preferredCarrierId
      ? MOCK_CARRIERS.filter((carrier) => carrier.id === preferredCarrierId)
      : MOCK_CARRIERS

  return carriers.flatMap((carrier) =>
    carrier.tractors
      .filter((tractor) => matchesPlateQuery(tractor.plateNumber, plateQuery))
      .map((tractor) => ({
        carrierId: carrier.id,
        carrierName: carrier.name,
        tractor,
      })),
  )
}

export function searchTrailers(
  plateQuery: string,
  preferredCarrierId?: string,
): CarrierTrailerMatch[] {
  const query = normalizePlate(plateQuery)
  const carriers =
    !query && preferredCarrierId
      ? MOCK_CARRIERS.filter((carrier) => carrier.id === preferredCarrierId)
      : MOCK_CARRIERS

  return carriers.flatMap((carrier) =>
    carrier.trailers
      .filter((trailer) => matchesPlateQuery(trailer.plateNumber, plateQuery))
      .map((trailer) => ({
        carrierId: carrier.id,
        carrierName: carrier.name,
        trailer,
      })),
  )
}

export function findExactTractorMatch(plateQuery: string): CarrierTractorMatch | undefined {
  const query = normalizePlate(plateQuery)
  if (!query) {
    return undefined
  }

  for (const carrier of MOCK_CARRIERS) {
    const tractor = carrier.tractors.find(
      (item) => normalizePlate(item.plateNumber) === query,
    )
    if (tractor) {
      return { carrierId: carrier.id, carrierName: carrier.name, tractor }
    }
  }

  return undefined
}

export function findExactTrailerMatch(plateQuery: string): CarrierTrailerMatch | undefined {
  const query = normalizePlate(plateQuery)
  if (!query) {
    return undefined
  }

  for (const carrier of MOCK_CARRIERS) {
    const trailer = carrier.trailers.find(
      (item) => normalizePlate(item.plateNumber) === query,
    )
    if (trailer) {
      return { carrierId: carrier.id, carrierName: carrier.name, trailer }
    }
  }

  return undefined
}
