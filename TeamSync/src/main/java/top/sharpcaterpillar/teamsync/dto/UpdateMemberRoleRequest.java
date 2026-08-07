package top.sharpcaterpillar.teamsync.dto;

import lombok.Data;

/**
 * 更新项目成员角色请求。
 */
@Data
public class UpdateMemberRoleRequest {

    /**
     * 角色类型：
     * 1=项目成员，2=项目管理员，3=项目访客，4=任务访客
     */
    private Integer roleType;
}
