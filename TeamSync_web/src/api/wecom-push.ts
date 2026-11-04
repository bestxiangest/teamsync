import request from '@/utils/http'

export type WecomReportType = 'DAILY' | 'WEEKLY'

export interface WecomSettings {
  webhookConfigured: boolean
  encryptionReady: boolean
  dispatchEnabled: boolean
  dailyEnabled: boolean
  dailyTimes: string[]
  weeklyEnabled: boolean
  weeklyTimes: string[]
  projectIds: number[]
  timezone: string
  weeklyDay: string
}

export interface WecomSettingsRequest {
  webhookUrl: string
  dailyEnabled: boolean
  dailyTimes: string[]
  weeklyEnabled: boolean
  weeklyTimes: string[]
  projectIds: number[]
}

export interface WecomProject {
  id: number
  name: string
}

export interface WecomTask {
  id: number
  projectName: string
  title: string
  assignees: string | null
  priority: number
  status: number
  dueTime: string | null
  deadlineHint: string
}

export interface WecomPreview {
  reportType: WecomReportType
  startDate: string
  endDate: string
  total: number
  completed: number
  processing: number
  notStarted: number
  overdue: number
  projectCount: number
  undated: number
  periodTotal: number
  periodCompleted: number
  periodProcessing: number
  periodNotStarted: number
  tasks: WecomTask[]
  messages: string[]
}

export interface WecomJob {
  id: number
  reportType: WecomReportType
  triggerType: 'SCHEDULED' | 'MANUAL'
  status: 'PENDING' | 'SENDING' | 'SUCCESS' | 'FAILED'
  totalParts: number
  sentParts: number
  errorMessage: string | null
  createdAt: string
  updatedAt: string
}

const base = '/system/wecom-push'

export const fetchWecomSettings = () => request.get<WecomSettings>({ url: `${base}/settings` })
export const saveWecomSettings = (data: WecomSettingsRequest) =>
  request.put<WecomSettings>({ url: `${base}/settings`, data })
export const fetchWecomProjects = () => request.get<WecomProject[]>({ url: `${base}/projects` })
export const fetchWecomPreview = (type: WecomReportType) =>
  request.get<WecomPreview>({ url: `${base}/preview/${type}` })
export const sendWecomReport = (type: WecomReportType) =>
  request.post<number>({ url: `${base}/send/${type}` })
export const fetchWecomJobs = () => request.get<WecomJob[]>({ url: `${base}/jobs` })
