import { useMemo, useState } from 'react'
import type { Contract, ContractStatus } from '../../dashboard'
import { useRequests } from '../model/RequestsContext'
import CreateRequestModal from './CreateRequestModal'

type Props = {
  contracts: Contract[]
}

function ContractsDataTable({ contracts }: { contracts: Contract[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full table-fixed border-separate border-spacing-0 text-sm">
        <colgroup>
          <col className="w-[25%]" />
          <col className="w-[18%]" />
          <col className="w-[25%]" />
          <col className="w-[17%]" />
          <col className="w-[30%]" />
        </colgroup>
        <thead>
          <tr>
            <th className="border-b border-slate-200 px-3 py-3 text-left font-semibold text-slate-600">
              Наименование
            </th>
            <th className="border-b border-slate-200 px-3 py-3 text-left font-semibold text-slate-600">
              Срок действия
            </th>
            <th className="border-b border-slate-200 px-3 py-3 text-left font-semibold text-slate-600">
              Сумма
            </th>
            <th className="border-b border-slate-200 px-3 py-3 text-left font-semibold text-slate-600">
              Валюта
            </th>
            <th className="border-b border-slate-200 px-3 py-3 text-left font-semibold text-slate-600">
              Организация
            </th>
          </tr>
        </thead>

        <tbody>
          {contracts.map((contract) => (
            <tr key={contract.id}>
              <td className="whitespace-nowrap border-b border-slate-100 px-3 py-3 font-semibold text-blue-600">
                {contract.id}
              </td>
              <td className="whitespace-nowrap border-b border-slate-100 px-3 py-3 text-slate-700">
                {contract.contractDate}
              </td>
              <td className="whitespace-nowrap border-b border-slate-100 px-3 py-3 text-slate-700">
                {contract.factualBalance}
              </td>
              <td className="whitespace-nowrap border-b border-slate-100 px-3 py-3 font-semibold text-slate-700">
                {contract.contractCurrency}
              </td>
              <td className="whitespace-nowrap border-b border-slate-100 px-3 py-3 font-semibold text-slate-700">
                {contract.legalEntity}
              </td>
            </tr>
          ))}

          {contracts.length === 0 && (
            <tr>
              <td className="px-3 py-6 text-center text-sm text-slate-500" colSpan={5}>
                По выбранным фильтрам контрактов не найдено
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

function ContractsTable({ contracts }: Props) {
  const { createRequest } = useRequests()
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLegalEntity, setSelectedLegalEntity] = useState('all')
  const [selectedStatuses, setSelectedStatuses] = useState<ContractStatus[]>([])
  const [isCreateRequestModalOpen, setIsCreateRequestModalOpen] = useState(false)

  const activeFiltersCount =
    (searchTerm.trim() ? 1 : 0) +
    (selectedLegalEntity !== 'all' ? 1 : 0) +
    (selectedStatuses.length > 0 ? 1 : 0)

  const resetFilters = () => {
    setSearchTerm('')
    setSelectedLegalEntity('all')
    setSelectedStatuses([])
  }

  const legalEntities = useMemo(
    () => Array.from(new Set(contracts.map((contract) => contract.legalEntity))),
    [contracts],
  )

  const filteredContracts = useMemo(() => {
    const normalizedSearchTerm = searchTerm.trim().toLowerCase()

    return contracts.filter((contract) => {
      const matchesLegalEntity =
        selectedLegalEntity === 'all' || contract.legalEntity === selectedLegalEntity

      const matchesSearch =
        normalizedSearchTerm.length === 0 || contract.id.toLowerCase().includes(normalizedSearchTerm)

      return matchesLegalEntity && matchesSearch
    })
  }, [contracts, searchTerm, selectedLegalEntity, selectedStatuses])

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h2 className="text-2xl font-bold text-slate-800">Контракты</h2>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setIsFiltersOpen((prevState) => !prevState)}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Фильтры {activeFiltersCount > 0 ? `(${activeFiltersCount})` : ''}
          </button>

          <button
            type="button"
            className="rounded-lg border border-blue-600 bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            onClick={() => setIsCreateRequestModalOpen(true)}
          >
            + Создать заявку
          </button>
        </div>
      </div>

      {isFiltersOpen && (
        <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="grid gap-3 md:grid-cols-3">
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Поиск по номеру
              </p>
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Например, К-2024"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-blue-400"
              />
            </div>

            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Юридическое лицо
              </p>
              <select
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-400"
                value={selectedLegalEntity}
                onChange={(event) => setSelectedLegalEntity(event.target.value)}
              >
                <option value="all">Все юридические лица</option>
                {legalEntities.map((entity) => (
                  <option key={entity} value={entity}>
                    {entity}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={resetFilters}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              Сбросить
            </button>
          </div>
        </div>
      )}

      <ContractsDataTable contracts={filteredContracts} />

      <CreateRequestModal
        isOpen={isCreateRequestModalOpen}
        contracts={contracts}
        onCreate={createRequest}
        onClose={() => setIsCreateRequestModalOpen(false)}
      />
    </section>
  )
}

export default ContractsTable
