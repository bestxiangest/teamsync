import request from '@/utils/http'

export type MemberRoleCode = 'owner' | 'admin' | 'member' | 'project_guest' | 'task_guest'

export interface Member {
  userId: number
  username: string
  nickname: string
  avatar: string
  role: MemberRoleCode
  roleType: number
  roleLabel: string
  projectOwner: boolean
  platformAdmin: boolean
  canEditRole: boolean
  canRemove: boolean
  joinedAt: string
}

export function getProjectMembers(projectId: number) {
  return request.get<Member[]>({
    url: `/projects/${projectId}/members`
  })
}

export function inviteMember(projectId: number, username: string, roleType?: number) {
  return request.post<Member>({
    url: `/projects/${projectId}/members`,
    params: { username, roleType }
  })
}

export function updateMemberRole(projectId: number, userId: number, roleType: number) {
  return request.put<Member>({
    url: `/projects/${projectId}/members/${userId}/role`,
    params: { roleType }
  })
}

export function removeMember(projectId: number, userId: number) {
  return request.del({
    url: `/projects/${projectId}/members/${userId}`
  })
}

export function quitProject(projectId: number) {
  return request.del({
    url: `/projects/${projectId}/members/quit`,
    showSuccessMessage: true
  })
}
