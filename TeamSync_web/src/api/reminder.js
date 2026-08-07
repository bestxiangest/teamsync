import request from '@/utils/http';
export function fetchGetReminderSettings() {
    return request.get({
        url: '/user/reminder-settings'
    });
}
export function fetchUpdateReminderSettings(data) {
    return request.put({
        url: '/user/reminder-settings',
        data
    });
}
export function fetchSendReminderTestEmail(data) {
    return request.post({
        url: '/user/reminder-settings/test-email',
        data
    });
}
export function fetchNotificationList(params) {
    return request.get({
        url: '/notifications',
        params
    });
}
export function fetchNotificationUnreadCount() {
    return request.get({
        url: '/notifications/unread-count'
    });
}
export function markNotificationRead(id) {
    return request.put({
        url: `/notifications/${id}/read`
    });
}
export function markNotificationsRead(data) {
    return request.put({
        url: '/notifications/read',
        data
    });
}
export function markAllNotificationsRead() {
    return request.put({
        url: '/notifications/read-all'
    });
}
//# sourceMappingURL=reminder.js.map
