package top.sharpcaterpillar.teamsync.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

/**
 * 任务成员关联表
 */
@TableName("pm_task_member")
public class PmTaskMember {

    /**
     * 任务ID
     */
    private Long taskId;

    /**
     * 用户ID
     */
    private Long userId;

    /**
     * 角色 EXECUTOR:执行者, FOLLOWER:关注者
     */
    private String role;

    public Long getTaskId() {
        return taskId;
    }

    public void setTaskId(Long taskId) {
        this.taskId = taskId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
}

