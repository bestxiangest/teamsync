package top.sharpcaterpillar.teamsync.dto;

import lombok.Data;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;

/**
 * 日历事件查询请求。
 */
@Data
public class CalendarEventQueryRequest {

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate startDate;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate endDate;

    /**
     * 逗号分隔：TASK/RECURRING_PLAN_RUN。
     * 也兼容 RECURRING_PLAN/RECURRING，均表示周期计划执行事件。
     */
    private String sourceType;

    private Long projectId;

    /**
     * 是否启用管理员视图。仅平台管理员的请求会生效。
     */
    private Boolean adminView;

    /**
     * 逗号分隔的负责人用户 ID，任务按执行者、周期计划按负责人匹配。
     */
    private String assigneeIds;

    /**
     * 逗号分隔：NOT_STARTED/IN_PROGRESS/COMPLETED/OVERDUE。
     */
    private String statuses;

    /**
     * 是否包含无截止日期的任务，仅供日视图使用。
     */
    private Boolean includeNoDueDate;
}
