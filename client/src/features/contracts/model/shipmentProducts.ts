export type ShipmentProductCategory = 'mdf' | 'pogonazh'

export const PRODUCT_KIND_LABELS = {
  mdf: 'Плита MDF',
  pogonazh: 'Погонаж',
  /** Заявки из 1С — в ЛК создать нельзя */
  lumber: 'Пиломатериалы',
} as const

export type ProductKindLabel = (typeof PRODUCT_KIND_LABELS)[keyof typeof PRODUCT_KIND_LABELS]

export const PRODUCT_KINDS: ProductKindLabel[] = Object.values(PRODUCT_KIND_LABELS)

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
