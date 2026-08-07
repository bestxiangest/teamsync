package top.sharpcaterpillar.teamsync.dto;

import lombok.Data;

/**
 * 邀请项目成员请求。
 */
@Data
public class InviteMemberRequest {

    /**
     * 要邀请的用户名。
     */
    private String username;

    /**
     * 可选角色类型：
     * 1=项目成员，2=项目管理员，3=项目访客，4=任务访客。
     * 默认按项目成员处理。
     */
    private Integer roleType;
}
