package top.sharpcaterpillar.teamsync.dto;

import lombok.Data;
import top.sharpcaterpillar.teamsync.vo.AssigneeVO;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 任务 DTO (用于看板展示)
 */
@Data
public class TaskDTO {

    /**
     * 任务ID
     */
    private Long id;

    /**
     * 所属阶段ID
     */
    private Long stageId;

    /**
     * 任务标题
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
     * 任务状态 0:未完成 1:已完成
     */
    private Integer status;

    /**
     * 开始时间
     */
    private LocalDateTime startTime;

    /**
     * 截止时间
     */
    private LocalDateTime dueTime;

    /**
     * 排序索引
     */
    private Integer sort;

    /**
     * 创建人ID
     */
    private Long creatorId;

    /**
     * 创建人名称（关联查询）
     */
    private String creatorName;

    /**
     * 创建人头像（关联查询）
     */
    private String creatorAvatar;

    /**
     * 负责人ID列表
     */
    private List<Long> assigneeIds;

    /**
     * 负责人详细信息列表（关联查询）
     */
    private List<AssigneeVO> assignees;

    /**
     * 关注人ID列表
     */
    private List<Long> followerIds;

    /**
     * 关注人详细信息列表（关联查询）
     */
    private List<AssigneeVO> followers;

    /**
     * 创建时间
     */
    private LocalDateTime createdAt;

    /**
     * 更新时间
     */
    private LocalDateTime updatedAt;

}
