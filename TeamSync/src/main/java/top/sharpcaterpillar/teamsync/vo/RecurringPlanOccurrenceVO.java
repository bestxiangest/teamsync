package top.sharpcaterpillar.teamsync.vo;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 周期计划执行记录响应对象。
 */
@Data
public class RecurringPlanOccurrenceVO {

    private Long id;

    private Long planId;

    private Integer occurrenceNo;

    private String title;

    private String status;

    private LocalDateTime scheduledStartAt;

    private LocalDateTime dueTime;

    private LocalDateTime completedAt;

    private Long completedBy;

    private String completedByName;

    private Long generatedTaskId;

    private List<AssigneeVO> assignees;

    private String notes;

    private Boolean overdue;

    private String overdueReason;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
