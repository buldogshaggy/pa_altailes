import type { ShipmentLine } from './types'

export function createShipmentLine(
  lineNumber: number,
  warehouse: string,
  nomenclature: string,
  quantity: string,
  shipped: string,
  price: string,
  amount: string,
): ShipmentLine {
  return { lineNumber, warehouse, nomenclature, quantity, shipped, price, amount }
}

/** Демо-строки отгрузки. Позже будут приходить из 1С. */
export const DEMO_SHIPMENT_LINES = {
  mdfMixed: [
    createShipmentLine(
      1,
      'Рубцовский ЛДК',
      'MDF 16 мм, 2800х2070х16',
      '120',
      '120',
      '4 850,00',
      '582 000,00',
    ),
    createShipmentLine(
      2,
      'Рубцовский ЛДК',
      'MDF 22 мм, 2800х2070х22',
      '80',
      '80',
      '5 200,00',
      '416 000,00',
    ),
  ],
  mdfPartial: [
    createShipmentLine(
      1,
      'Каменский ЛДК',
      'MDF 16 мм, 2800х2070х16',
      '95',
      '95',
      '4 850,00',
      '460 750,00',
    ),
    createShipmentLine(
      2,
      'Каменский ЛДК',
      'MDF 22 мм, 2800х2070х22',
      '60',
      '48',
      '5 200,00',
      '249 600,00',
    ),
  ],
  singleMdf16: [
    createShipmentLine(
      1,
      'Рубцовский ЛДК',
      'MDF 16 мм, 2800х2070х16',
      '45',
      '0',
      '4 850,00',
      '218 250,00',
    ),
  ],
  singleMdf22: [
    createShipmentLine(
      1,
      'Каменский ЛДК',
      'MDF 22 мм, 2800х2070х22',
      '32',
      '0',
      '5 200,00',
      '166 400,00',
    ),
  ],
  singleMolding: [
    createShipmentLine(1, 'ООО Содружество', 'Молдинг, 40х20', '500', '0', '185,00', '92 500,00'),
  ],
  singlePlinth: [
    createShipmentLine(1, 'Рубцовский ЛДК', 'Плинтус, 80 мм', '300', '180', '210,00', '37 800,00'),
  ],
  singleJamb: [
    createShipmentLine(1, 'ООО Содружество', 'Наличник, 70х20', '220', '0', '195,00', '42 900,00'),
  ],
  singleLumber: [
    createShipmentLine(
      1,
      'Рубцовский ЛДК',
      'Доска обрезная 50х150х6000, 1 сорт',
      '120',
      '0',
      '18 500,00',
      '2 220 000,00',
    ),
  ],
} satisfies Record<string, ShipmentLine[]>
