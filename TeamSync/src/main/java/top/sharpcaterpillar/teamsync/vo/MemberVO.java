package top.sharpcaterpillar.teamsync.vo;

import java.time.LocalDateTime;

/**
 * 项目成员 VO。
 */
public class MemberVO {

    private Long userId;

    private String username;

    private String nickname;

    private String avatar;

    private String role;

    private Integer roleType;

    private String roleLabel;

    private Boolean projectOwner;

    private Boolean platformAdmin;

    private Boolean canEditRole;

    private Boolean canRemove;

    private LocalDateTime joinedAt;

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

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public Integer getRoleType() {
        return roleType;
    }

    public void setRoleType(Integer roleType) {
        this.roleType = roleType;
    }

    public String getRoleLabel() {
        return roleLabel;
    }

    public void setRoleLabel(String roleLabel) {
        this.roleLabel = roleLabel;
    }

    public Boolean getProjectOwner() {
        return projectOwner;
    }

    public void setProjectOwner(Boolean projectOwner) {
        this.projectOwner = projectOwner;
    }

    public Boolean getPlatformAdmin() {
        return platformAdmin;
    }

    public void setPlatformAdmin(Boolean platformAdmin) {
        this.platformAdmin = platformAdmin;
    }

    public Boolean getCanEditRole() {
        return canEditRole;
    }

    public void setCanEditRole(Boolean canEditRole) {
        this.canEditRole = canEditRole;
    }

    public Boolean getCanRemove() {
        return canRemove;
    }

    public void setCanRemove(Boolean canRemove) {
        this.canRemove = canRemove;
    }

    public LocalDateTime getJoinedAt() {
        return joinedAt;
    }

    public void setJoinedAt(LocalDateTime joinedAt) {
        this.joinedAt = joinedAt;
    }
}
