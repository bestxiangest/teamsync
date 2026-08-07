package top.sharpcaterpillar.teamsync.vo;

/**
 * 用户邮件提醒设置响应
 */
public class UserReminderSettingsVO {

    private Long userId;

    private String username;

    private String nickname;

    private String avatar;

    private String email;

    private Boolean isAdmin;

    private Boolean emailReminderEnabled;

    private Boolean overdueTaskReminderEnabled;

    private Boolean taskCompletedEnabled;

    private Boolean mailChannelReady;

    private Boolean schedulerEnabled;

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getNickname() {
        return nickname;
    }

    public void setNickname(String nickname) {
        this.nickname = nickname;
    }

    public String getAvatar() {
        return avatar;
    }

    public void setAvatar(String avatar) {
        this.avatar = avatar;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Boolean getIsAdmin() {
        return isAdmin;
    }

    public void setIsAdmin(Boolean isAdmin) {
        this.isAdmin = isAdmin;
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

    public Boolean getMailChannelReady() {
        return mailChannelReady;
    }

    public void setMailChannelReady(Boolean mailChannelReady) {
        this.mailChannelReady = mailChannelReady;
    }

    public Boolean getSchedulerEnabled() {
        return schedulerEnabled;
    }

    public void setSchedulerEnabled(Boolean schedulerEnabled) {
        this.schedulerEnabled = schedulerEnabled;
    }
}
