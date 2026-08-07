package top.sharpcaterpillar.teamsync.vo;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 周期计划响应对象。
 */
@Data
public class RecurringPlanVO {

    private Long id;

    private Long projectId;

    private Long stageId;

    private String title;

    private String description;

    private Integer priority;

    private String status;

    private String recurrenceUnit;

    private Integer intervalCount;

    private LocalDateTime startTime;

    private LocalDateTime dueTime;

    private LocalDateTime endTime;

    private LocalDateTime nextRunAt;

    private LocalDateTime nextDueTime;

    private LocalDateTime lastRunAt;

    private String timezone;

    private Boolean reminderEnabled;

    private Integer reminderMinutesBefore;

    private Boolean autoCreateTask;

    private Integer maxOccurrences;

    private Integer generatedCount;

    private Long creatorId;

    private String creatorName;

    private String creatorAvatar;

    private List<Long> assigneeIds;

    private List<AssigneeVO> assignees;

    private Boolean overdue;

    private String overdueReason;

    private String currentOccurrenceStatus;

    private Boolean currentOccurrenceActionable;

    private Long currentOccurrenceId;

    private Integer currentOccurrenceNo;

    private Long currentGeneratedTaskId;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
