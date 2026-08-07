import request from '@/utils/http'
/**
 * 获取工作台数据
 */
export function getWorkbenchData() {
  return request.get({
    url: '/dashboard/workbench'
  })
}
export function getOverviewData() {
  return request.get({
    url: '/dashboard/overview'
  })
}
export function getManagementData(params) {
  return request.get({
    url: '/dashboard/management',
    params
  })
}
//# sourceMappingURL=dashboard.js.map
