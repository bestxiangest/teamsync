package top.sharpcaterpillar.teamsync.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 任务请求 DTO (用于创建/更新任务)
 */
@Data
public class TaskRequest {

    /**
     * 项目ID (创建时必填)
     */
    private Long projectId;

    /**
     * 阶段ID (创建时必填)
     */
    private Long stageId;

    /**
     * 任务标题 (必填)
     */
    private String title;

    /**
     * 任务描述
     */
    private String description;

    /**
     * 优先级 1:普通 2:紧急 3:非常紧急
     */
    private Integer priority;

    /**
     * 任务状态 0:未开始 1:已完成 2:处理中
     */
    private Integer status;

    /**
     * 开始时间
     */
    private LocalDateTime startTime;

    /**
     * 是否清除开始时间
     */
    private Boolean clearStartTime;

    /**
     * 截止时间
     */
    private LocalDateTime dueTime;

    /**
     * 是否清除截止时间
     */
    private Boolean clearDueTime;

    /**
     * 负责人ID列表
     */
    private List<Long> assigneeIds;

    /**
     * 关注人ID列表
     */
    private List<Long> followerIds;

}
