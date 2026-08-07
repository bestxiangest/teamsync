package top.sharpcaterpillar.teamsync.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;

import java.time.LocalDateTime;

/**
 * 用户邮件提醒设置
 */
@TableName("sys_user_reminder_setting")
public class SysUserReminderSetting {

    @TableId(value = "user_id", type = IdType.INPUT)
    private Long userId;

    private Boolean emailEnabled;

    private Boolean overdueTaskEnabled;

    private Boolean taskCompletedEnabled;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Boolean getEmailEnabled() {
        return emailEnabled;
    }

    public void setEmailEnabled(Boolean emailEnabled) {
        this.emailEnabled = emailEnabled;
    }

    public Boolean getOverdueTaskEnabled() {
        return overdueTaskEnabled;
    }

    public void setOverdueTaskEnabled(Boolean overdueTaskEnabled) {
        this.overdueTaskEnabled = overdueTaskEnabled;
    }

    public Boolean getTaskCompletedEnabled() {
        return taskCompletedEnabled;
    }

    public void setTaskCompletedEnabled(Boolean taskCompletedEnabled) {
        this.taskCompletedEnabled = taskCompletedEnabled;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
