import request from '@/utils/http';

export function getProjectMembers(projectId) {
    return request.get({
        url: `/projects/${projectId}/members`
    });
}

export function inviteMember(projectId, username, roleType) {
    return request.post({
        url: `/projects/${projectId}/members`,
        params: { username, roleType }
    });
}

export function updateMemberRole(projectId, userId, roleType) {
    return request.put({
        url: `/projects/${projectId}/members/${userId}/role`,
        params: { roleType }
    });
}

export function removeMember(projectId, userId) {
    return request.del({
        url: `/projects/${projectId}/members/${userId}`
    });
}

export function quitProject(projectId) {
    return request.del({
        url: `/projects/${projectId}/members/quit`,
        showSuccessMessage: true
    });
}
