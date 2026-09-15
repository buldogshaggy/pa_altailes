export type ShipmentProductCategory = 'mdf' | 'pogonazh'

export const PRODUCT_KIND_LABELS = {
  mdf: 'Плита MDF',
  pogonazh: 'Погонаж',
  /** Заявки из 1С — в ЛК создать нельзя */
  lumber: 'Пиломатериалы',
} as const

export type ProductKindLabel = (typeof PRODUCT_KIND_LABELS)[keyof typeof PRODUCT_KIND_LABELS]

export const PRODUCT_KINDS: ProductKindLabel[] = Object.values(PRODUCT_KIND_LABELS)

/** В одной заявке по плитам MDF должно быть ровно 8 пачек (1 машина). */
export const MDF_PACKS_PER_VEHICLE = 8

export const MDF_BOARD_TYPES = [
  { value: 'hdf', label: 'HDF (плита высокой плотности)' },
  { value: 'mdf-s', label: 'MDF S (плита стандартная)' },
  { value: 'mdf-t', label: 'MDF T (плита для фрезеровки)' },
  { value: 'mdf-lam-s', label: 'MDF Ламинированная S (стандартная)' },
  { value: 'mdf-lam-t', label: 'MDF Ламинированная T (для фрезеровки)' },
] as const

export type MdfBoardType = (typeof MDF_BOARD_TYPES)[number]['value']

/** Форматы плит в мм. Пока черновые варианты, позже уточним по каталогу 1С. */
export const MDF_FORMATS_BY_TYPE: Record<MdfBoardType, string[]> = {
  hdf: ['2440×1220', '2800×2070', '3050×1220'],
  'mdf-s': ['2440×1220', '2800×2070', '3660×1830'],
  'mdf-t': ['2800×2070', '2800×1220', '3660×2070'],
  'mdf-lam-s': ['2440×1220', '2800×2070', '2800×1220'],
  'mdf-lam-t': ['2800×2070', '3050×1220', '3660×2070'],
}

export const MDF_SIDES = [
  { value: 'single', label: 'Односторонняя' },
  { value: 'double', label: 'Двухсторонняя' },
] as const

export type MdfSide = (typeof MDF_SIDES)[number]['value']

export const MDF_THICKNESSES_MM = [6, 8, 10, 16, 18, 19, 25] as const

export const formatMdfNomenclature = (params: {
  boardType: MdfBoardType | ''
  format: string
  side: MdfSide | ''
  thicknessMm: string
}): string => {
  if (!params.boardType || !params.format || !params.side || !params.thicknessMm) {
    return ''
  }

  const boardLabel =
    MDF_BOARD_TYPES.find((type) => type.value === params.boardType)?.label ?? params.boardType
  const sideLabel = MDF_SIDES.find((side) => side.value === params.side)?.label ?? params.side

  return `${boardLabel}, ${params.format} мм, ${sideLabel}, ${params.thicknessMm} мм`
}

export type ShipmentProduct = {
  name: string
  category: ShipmentProductCategory
}

/** Продукция, которую непосредственно отгружают. Позже список будет приходить из 1С. */
export const SHIPMENT_PRODUCTS: ShipmentProduct[] = [
  { name: 'MDF 16 мм', category: 'mdf' },
  { name: 'MDF 18 мм', category: 'mdf' },
  { name: 'MDF 22 мм', category: 'mdf' },
  { name: 'MDF влагостойкая 18 мм', category: 'mdf' },
  { name: 'MDF ламинированная 16 мм', category: 'mdf' },
  { name: 'Плинтус', category: 'pogonazh' },
  { name: 'Наличник', category: 'pogonazh' },
  { name: 'Молдинг', category: 'pogonazh' },
  { name: 'Карниз', category: 'pogonazh' },
  { name: 'Уголок', category: 'pogonazh' },
]

export const SHIPMENT_PRODUCT_NAMES = SHIPMENT_PRODUCTS.map((product) => product.name)

export const shipmentProductsByCategory = (category: ShipmentProductCategory): string[] =>
  SHIPMENT_PRODUCTS.filter((product) => product.category === category).map(
    (product) => product.name,
  )
