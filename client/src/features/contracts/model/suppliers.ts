export const SUPPLIERS = [
  'Павловский ДОК',
  'Рубцовский ЛДК',
  'Каменский ЛДК',
  'ООО Содружество',
  'ООО Новичиха Лес',
] as const

export type Supplier = (typeof SUPPLIERS)[number]

/** Какие заводы доступны для вида продукции */
export const SUPPLIERS_BY_PRODUCT = {
  mdf: ['Павловский ДОК'],
  lumber: ['Рубцовский ЛДК', 'Каменский ЛДК'],
  pogonazh: ['ООО Содружество', 'ООО Новичиха Лес'],
} as const satisfies Record<string, readonly Supplier[]>
