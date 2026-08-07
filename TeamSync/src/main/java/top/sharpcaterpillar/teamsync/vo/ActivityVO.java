package top.sharpcaterpillar.teamsync.vo;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 活动流 VO（评论 + 日志 混合）
 */
@Data
public class ActivityVO {

    /**
     * 活动ID
     */
    private Long id;

    /**
     * 活动类型: comment / log
     */
    private String type;

    /**
     * 任务ID
     */
    private Long taskId;

    /**
     * 用户ID (评论人/操作人)
     */
    private Long userId;

    /**
     * 用户名
     */
    private String username;

    /**
     * 用户昵称
     */
    private String nickname;

    /**
     * 用户头像
     */
    private String avatar;

    /**
     * 内容 (评论内容 / 操作描述)
     */
    private String content;

    /**
     * 操作类型 (仅日志有效: CREATE/UPDATE/MOVE/DELETE/COMMENT)
     */
    private String actionType;

    /**
     * 创建时间
     */
    private LocalDateTime createdAt;

}

