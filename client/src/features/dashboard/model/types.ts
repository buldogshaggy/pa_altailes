export type ContractStatus = 'active' | 'expiring' | 'inactive'

export type Contract = {
  id: string
  legalEntity: string
  supplier: string
  contractDate: string
  factualBalance: string
  contractCurrency: string
}

export type DashboardData = {
  contracts: Contract[]
}
