package top.sharpcaterpillar.teamsync.vo;

import lombok.Data;

/**
 * 任务负责人 VO
 */
@Data
public class AssigneeVO {

    /**
     * 用户ID
     */
    private Long userId;

    /**
     * 昵称
     */
    private String nickname;

    /**
     * 头像
     */
    private String avatar;

}

