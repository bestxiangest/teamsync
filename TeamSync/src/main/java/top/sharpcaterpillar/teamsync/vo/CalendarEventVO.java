package top.sharpcaterpillar.teamsync.vo;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 日历事件响应对象。
 */
@Data
public class CalendarEventVO {

    private String id;

    private String sourceType;

    private Long sourceId;

    private String title;

    /**
     * 任务/周期计划描述，用于日视图展示。
     */
    private String description;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    private LocalDateTime dueTime;

    private Boolean allDay;

    private String status;

    private Integer priority;

    private Long projectId;

    private String projectName;

    /**
     * 创建人，负责人为空时前端回退展示。
     */
    private Long creatorId;

    private String creatorName;

    private String colorType;

    private Boolean overdue;

    private String targetPath;

    /**
     * 负责人（任务为执行者，周期计划为负责人）。
     */
    private List<AssigneeVO> assignees;
}
