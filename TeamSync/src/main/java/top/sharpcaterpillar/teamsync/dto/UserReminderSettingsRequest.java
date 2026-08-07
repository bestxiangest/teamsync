package top.sharpcaterpillar.teamsync.dto;

/**
 * 用户邮件提醒设置请求
 */
public class UserReminderSettingsRequest {

    private String email;

    private Boolean emailReminderEnabled;

    private Boolean overdueTaskReminderEnabled;

    private Boolean taskCompletedEnabled;

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Boolean getEmailReminderEnabled() {
        return emailReminderEnabled;
    }

    public void setEmailReminderEnabled(Boolean emailReminderEnabled) {
        this.emailReminderEnabled = emailReminderEnabled;
    }

    public Boolean getOverdueTaskReminderEnabled() {
        return overdueTaskReminderEnabled;
    }

    public void setOverdueTaskReminderEnabled(Boolean overdueTaskReminderEnabled) {
        this.overdueTaskReminderEnabled = overdueTaskReminderEnabled;
    }

    public Boolean getTaskCompletedEnabled() {
        return taskCompletedEnabled;
    }

    public void setTaskCompletedEnabled(Boolean taskCompletedEnabled) {
        this.taskCompletedEnabled = taskCompletedEnabled;
    }
}
