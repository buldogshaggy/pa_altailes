import { ContractsTable } from '../features/contracts'
import { useDashboardData } from '../features/dashboard'

function DashboardPage() {
  const { data, isLoading } = useDashboardData()

  if (isLoading || !data) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
        Загружаю данные дашборда...
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <ContractsTable contracts={data.contracts} />
    </div>
  )
}

export default DashboardPage
