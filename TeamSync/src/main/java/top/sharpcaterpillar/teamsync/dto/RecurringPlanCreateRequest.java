package top.sharpcaterpillar.teamsync.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 周期计划创建请求。
 */
@Data
public class RecurringPlanCreateRequest {

    private Long projectId;

    private Long stageId;

    private String title;

    private String description;

    private Integer priority;

    private String recurrenceUnit;

    private Integer intervalCount;

    private LocalDateTime startTime;

    private LocalDateTime dueTime;

    private LocalDateTime endTime;

    private String timezone;

    private Boolean reminderEnabled;

    private Integer reminderMinutesBefore;

    private Boolean autoCreateTask;

    private Integer maxOccurrences;

    private List<Long> assigneeIds;
}
