import { useQuery } from '@tanstack/react-query'
import { http } from '../../../api/http'
import { isDemoMode } from '../../../config'
import { useAuth } from '../../auth'
import type { DashboardData } from './types'
import { dashboardData } from './dashboardData'

const loadDashboard = async (legalEntities: string[]): Promise<DashboardData> => {
  if (isDemoMode) {
    return {
      contracts: dashboardData.contracts.filter((contract) =>
        legalEntities.includes(contract.legalEntity),
      ),
    }
  }

  try {
    const { data } = await http.get<DashboardData>('/api/contracts', {
      params: {
        legalEntities: legalEntities.join(','),
      },
    })

    return data
  } catch {
    return {
      contracts: dashboardData.contracts.filter((contract) =>
        legalEntities.includes(contract.legalEntity),
      ),
    }
  }
}

export const useDashboardData = () => {
  const { user } = useAuth()
  const legalEntities = user?.legalEntities ?? []

  return useQuery({
    queryKey: ['dashboard-data', legalEntities, isDemoMode],
    queryFn: () => loadDashboard(legalEntities),
    enabled: legalEntities.length > 0,
    staleTime: 60_000,
  })
}
