package top.sharpcaterpillar.teamsync.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 项目成员表
 */
@TableName("pm_project_member")
public class PmProjectMember {

    /**
     * 项目ID
     */
    private Long projectId;

    /**
     * 用户ID
     */
    private Long userId;

    /**
     * 自定义分组ID (0:根目录)
     */
    private Long customGroupId;

    /**
     * 角色类型 1:普通成员 2:管理员
     */
    private Integer roleType;

    /**
     * 加入时间
     */
    private LocalDateTime joinedAt;

    public Long getProjectId() {
        return projectId;
    }

    public void setProjectId(Long projectId) {
        this.projectId = projectId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getCustomGroupId() {
        return customGroupId;
    }

    public void setCustomGroupId(Long customGroupId) {
        this.customGroupId = customGroupId;
    }

    public Integer getRoleType() {
        return roleType;
    }

    public void setRoleType(Integer roleType) {
        this.roleType = roleType;
    }

    public LocalDateTime getJoinedAt() {
        return joinedAt;
    }

    public void setJoinedAt(LocalDateTime joinedAt) {
        this.joinedAt = joinedAt;
    }
}

