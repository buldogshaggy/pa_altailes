export const SUPPLIERS = [
  'Рубцовский ЛДК',
  'Каменский ЛДК',
  'ООО Содружество',
] as const

export type Supplier = (typeof SUPPLIERS)[number]
