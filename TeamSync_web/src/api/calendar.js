import request from '@/utils/http';

export function fetchCalendarEvents(params) {
    return request.get({
        url: '/calendar/events',
        params
    });
}
export function fetchCalendarAssignees(projectId) {
    return request.get({
        url: '/calendar/assignees',
        params: { projectId }
    });
}
