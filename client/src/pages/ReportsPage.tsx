import { Fragment, useState } from 'react'

type InWorkRow = {
  requestNumber: string
  requestDate: string
  plannedShipmentDate: string
  requestedAmount: string
  carNumber?: string
  wagonNumber?: string
  driver?: string
  driverPhone?: string
  direction?: string
  nomenclature: Array<{ name: string; amount: string }>
}

const dailyMetrics = [
  { label: 'Остаток ДС', value: '1 304 581,18' },
  { label: 'Объем по плану', value: '-' },
  { label: 'Всего заказано', value: '512,871' },
  { label: 'Выполнено', value: '288,000' },
  { label: 'Отклонение по плану', value: '-' },
]

const inWorkRows: InWorkRow[] = [
  {
    requestNumber: '000023925',
    requestDate: '06.04.2026 16:44:49',
    plannedShipmentDate: '08.04.2026',
    requestedAmount: '58,520',
    direction: 'Богданович',
    nomenclature: [
      { name: 'ОПОРА ПОД МДФ 2070', amount: '32,000' },
      { name: 'Плита древес. 2800x2070x22 мм, Ш, 1 сорт, MDF T', amount: '26,520' },
    ],
  },
  {
    requestNumber: '000023926',
    requestDate: '06.04.2026 16:47:20',
    plannedShipmentDate: '15.04.2026',
    requestedAmount: '58,520',
    direction: 'Богданович',
    nomenclature: [],
  },
  {
    requestNumber: '000023927',
    requestDate: '07.04.2026 08:14:04',
    plannedShipmentDate: '10.04.2026',
    requestedAmount: '55,368',
    direction: 'Ишим',
    nomenclature: [],
  },
  {
    requestNumber: '000023940',
    requestDate: '07.04.2026 11:36:31',
    plannedShipmentDate: '10.04.2026',
    requestedAmount: '56,759',
    direction: 'Екатеринбург',
    nomenclature: [],
  },
]

function ReportsPage() {
  const [expandedRequests, setExpandedRequests] = useState<Record<string, boolean>>({
    '000023925': true,
  })

  const toggleRequest = (requestNumber: string) => {
    setExpandedRequests((prevState) => ({
      ...prevState,
      [requestNumber]: !prevState[requestNumber],
    }))
  }

  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="inline-flex rounded-md bg-sky-100 px-3 py-1 text-3xl font-bold text-slate-900">
          Ежедневный отчет
        </h2>

        <div className="mt-4 max-w-xl divide-y divide-slate-100 rounded-lg border border-slate-200">
          {dailyMetrics.map((metric) => (
            <div key={metric.label} className="grid grid-cols-2 gap-3 px-4 py-2.5 text-sm">
              <span className="text-slate-700">{metric.label}</span>
              <span className="text-right font-semibold text-slate-900">{metric.value}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
        <h3 className="mb-3 inline-flex rounded-md bg-emerald-100 px-3 py-1 text-3xl font-bold text-slate-900">
          Отгружено
        </h3>

        <div className="overflow-x-auto">
          <table className="min-w-[1220px] border-separate border-spacing-0 text-sm">
            <thead>
              <tr>
                <th className="border border-slate-200 bg-[#f0f8f5] px-2 py-2 text-left font-medium">Номер заявки</th>
                <th className="border border-slate-200 bg-[#f0f8f5] px-2 py-2 text-left font-medium">Дата заявки</th>
                <th className="border border-slate-200 bg-[#f0f8f5] px-2 py-2 text-left font-medium">Дата отгрузки</th>
                <th className="border border-slate-200 bg-[#f0f8f5] px-2 py-2 text-left font-medium">Количество по заявке</th>
                <th className="border border-slate-200 bg-[#f0f8f5] px-2 py-2 text-left font-medium">Гос. номер автомобиля</th>
                <th className="border border-slate-200 bg-[#f0f8f5] px-2 py-2 text-left font-medium">Номер вагона</th>
                <th className="border border-slate-200 bg-[#f0f8f5] px-2 py-2 text-left font-medium">Вес брутто, кг</th>
                <th className="border border-slate-200 bg-[#f0f8f5] px-2 py-2 text-left font-medium">Водитель</th>
                <th className="border border-slate-200 bg-[#f0f8f5] px-2 py-2 text-left font-medium">Телефон водителя</th>
                <th className="border border-slate-200 bg-[#f0f8f5] px-2 py-2 text-left font-medium">Направление</th>
                <th className="border border-slate-200 bg-[#f0f8f5] px-2 py-2 text-left font-medium">Счет-фактура</th>
                <th className="border border-slate-200 bg-[#f0f8f5] px-2 py-2 text-left font-medium">Товарная накладная</th>
              </tr>
              <tr>
                <th className="border border-slate-200 bg-[#f0f8f5] px-2 py-2 text-left font-medium">Номенклатура</th>
                <th className="border border-slate-200 bg-[#f0f8f5] px-2 py-2 text-left font-medium">Количество (отгружено)</th>
                <th
                  className="border border-slate-200 bg-[#f0f8f5] px-2 py-2 text-left font-medium"
                  colSpan={10}
                >
                  Количество пачек отгружено
                </th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td className="border border-slate-100 px-2 py-4 text-slate-400" colSpan={12}>
                  Нет отгруженных позиций за выбранную дату
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
        <h3 className="mb-3 inline-flex rounded-md bg-rose-100 px-3 py-1 text-3xl font-bold text-slate-900">
          В работе
        </h3>

        <div className="overflow-x-auto">
          <table className="min-w-[1220px] border-separate border-spacing-0 text-sm">
            <thead>
              <tr>
                <th className="border border-slate-200 bg-rose-50 px-2 py-2 text-left font-medium">Номер заявки</th>
                <th className="border border-slate-200 bg-rose-50 px-2 py-2 text-left font-medium">Дата заявки</th>
                <th className="border border-slate-200 bg-rose-50 px-2 py-2 text-left font-medium">Дата отгрузки плановая</th>
                <th className="border border-slate-200 bg-rose-50 px-2 py-2 text-left font-medium">Количество по заявке</th>
                <th className="border border-slate-200 bg-rose-50 px-2 py-2 text-left font-medium">Гос. номер автомобиля</th>
                <th className="border border-slate-200 bg-rose-50 px-2 py-2 text-left font-medium">Номер вагона</th>
                <th className="border border-slate-200 bg-rose-50 px-2 py-2 text-left font-medium">Водитель</th>
                <th className="border border-slate-200 bg-rose-50 px-2 py-2 text-left font-medium">Телефон водителя</th>
                <th className="border border-slate-200 bg-rose-50 px-2 py-2 text-left font-medium">Направление</th>
              </tr>
              <tr>
                <th className="border border-slate-200 bg-rose-50 px-2 py-2 text-left font-medium">Номенклатура</th>
                <th className="border border-slate-200 bg-rose-50 px-2 py-2 text-left font-medium" colSpan={8}>
                  Количество (заявка)
                </th>
              </tr>
            </thead>

            <tbody>
              {inWorkRows.map((row) => {
                const isExpanded = Boolean(expandedRequests[row.requestNumber])

                return (
                <Fragment key={row.requestNumber}>
                  <tr>
                    <td className="border border-slate-100 px-2 py-1.5 text-blue-600">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => toggleRequest(row.requestNumber)}
                          className="inline-flex h-5 w-5 items-center justify-center rounded border border-slate-300 text-xs text-slate-700 hover:bg-slate-100"
                          aria-label={isExpanded ? 'Свернуть заявку' : 'Раскрыть заявку'}
                        >
                          {isExpanded ? '−' : '+'}
                        </button>
                        <span>{row.requestNumber}</span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap border border-slate-100 px-2 py-1.5 text-slate-700">
                      {row.requestDate}
                    </td>
                    <td className="whitespace-nowrap border border-slate-100 px-2 py-1.5 text-slate-700">
                      {row.plannedShipmentDate}
                    </td>
                    <td className="border border-slate-100 px-2 py-1.5 text-right text-slate-700">
                      {row.requestedAmount}
                    </td>
                    <td className="border border-slate-100 px-2 py-1.5 text-slate-700">{row.carNumber ?? ''}</td>
                    <td className="border border-slate-100 px-2 py-1.5 text-slate-700">{row.wagonNumber ?? ''}</td>
                    <td className="border border-slate-100 px-2 py-1.5 text-slate-700">{row.driver ?? ''}</td>
                    <td className="border border-slate-100 px-2 py-1.5 text-slate-700">{row.driverPhone ?? ''}</td>
                    <td className="border border-slate-100 px-2 py-1.5 text-slate-700">{row.direction ?? ''}</td>
                  </tr>

                  {isExpanded && (
                    row.nomenclature.length > 0 ? (
                      row.nomenclature.map((item) => (
                        <tr key={`${row.requestNumber}-${item.name}`}>
                          <td className="border border-slate-100 bg-slate-50 px-2 py-1.5 pl-8 text-slate-700">
                            {item.name}
                          </td>
                          <td className="border border-slate-100 px-2 py-1.5 text-right text-slate-700" colSpan={8}>
                            {item.amount}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr key={`${row.requestNumber}-empty`}>
                        <td className="border border-slate-100 bg-slate-50 px-2 py-1.5 pl-8 text-slate-500" colSpan={9}>
                          Номенклатура не заполнена
                        </td>
                      </tr>
                    )
                  )}
                </Fragment>
              )})}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

export default ReportsPage
