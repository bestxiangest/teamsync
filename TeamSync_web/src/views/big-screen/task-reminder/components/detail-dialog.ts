export type ScreenDetailType =
  | 'urgentTasks'
  | 'projectRisks'
  | 'recurringPlans'
  | 'assignees'
  | 'workloadRanking'
  | 'collaborationReminders'
  | 'futureTasks'

export interface ScreenDetailRequest {
  type: ScreenDetailType
  title: string
}
