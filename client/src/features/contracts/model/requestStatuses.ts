export const REQUEST_STATUSES = {
  new: 'Новый',
  pendingApproval: 'На согласовании',
  approvedByManager: 'Согласована менеджером',
  powerOfAttorneyFilled: 'Доверенность заполнена',
  inProgress: 'В работе',
  completed: 'Выполнен',
  cancelled: 'Отменена',
} as const

export type RequestStatus = (typeof REQUEST_STATUSES)[keyof typeof REQUEST_STATUSES]

export const ALL_REQUEST_STATUSES: RequestStatus[] = Object.values(REQUEST_STATUSES)

export const requiresPowerOfAttorney = (status: string) =>
  status === REQUEST_STATUSES.approvedByManager

export const canOpenPowerOfAttorney = (request: {
  requestStatus: string
  powerOfAttorney?: unknown
  vehicleInfo?: unknown
}) =>
  requiresPowerOfAttorney(request.requestStatus) ||
  Boolean(request.powerOfAttorney) ||
  Boolean(request.vehicleInfo)

export const statusBadgeClasses: Record<string, string> = {
  [REQUEST_STATUSES.new]: 'bg-slate-100 text-slate-700',
  [REQUEST_STATUSES.pendingApproval]: 'bg-amber-100 text-amber-800',
  [REQUEST_STATUSES.approvedByManager]: 'bg-blue-100 text-blue-800',
  [REQUEST_STATUSES.powerOfAttorneyFilled]: 'bg-indigo-100 text-indigo-800',
  [REQUEST_STATUSES.inProgress]: 'bg-violet-100 text-violet-800',
  [REQUEST_STATUSES.completed]: 'bg-emerald-100 text-emerald-800',
  [REQUEST_STATUSES.cancelled]: 'bg-rose-100 text-rose-800',
}
