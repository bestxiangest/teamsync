import request from '@/utils/http';

export function fetchRecurringPlanList(params) {
    return request.get({
        url: '/recurring-plans',
        params
    });
}

export function getRecurringPlan(id) {
    return request.get({
        url: `/recurring-plans/${id}`
    });
}

export function createRecurringPlan(data) {
    return request.post({
        url: '/recurring-plans',
        data
    });
}

export function updateRecurringPlan(id, data) {
    return request.put({
        url: `/recurring-plans/${id}`,
        data
    });
}

export function updateRecurringPlanStatus(id, status) {
    return request.put({
        url: `/recurring-plans/${id}/status`,
        data: { status }
    });
}
export function fetchRecurringPlanOccurrences(id, params) {
    return request.get({
        url: `/recurring-plans/${id}/occurrences`,
        params
    });
}
export function completeRecurringPlanCurrent(id, data) {
    return request.post({
        url: `/recurring-plans/${id}/occurrences/current/complete`,
        data
    });
}
export function generateRecurringPlanCurrentTask(id) {
    return request.post({
        url: `/recurring-plans/${id}/occurrences/current/generate-task`
    });
}
export function skipRecurringPlanCurrent(id, data) {
    return request.post({
        url: `/recurring-plans/${id}/occurrences/current/skip`,
        data
    });
}
export function deferRecurringPlanCurrent(id, data) {
    return request.post({
        url: `/recurring-plans/${id}/occurrences/current/defer`,
        data
    });
}

export function deleteRecurringPlan(id) {
    return request.del({
        url: `/recurring-plans/${id}`
    });
}
