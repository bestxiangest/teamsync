package top.sharpcaterpillar.teamsync.vo;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * 管理看板统计报表。
 */
@Data
public class DashboardManagementVO {

    private FilterVO filter = new FilterVO();
    private List<OptionVO> projectOptions = new ArrayList<>();
    private List<OptionVO> memberOptions = new ArrayList<>();
    private SummaryVO summary = new SummaryVO();
    private List<DashboardTaskTrendVO> taskTrend = new ArrayList<>();
    private List<ProjectMetricVO> projectMetrics = new ArrayList<>();
    private List<MemberWorkloadVO> memberWorkloads = new ArrayList<>();
    private List<RecurringPlanMetricVO> recurringPlans = new ArrayList<>();

    @Data
    public static class FilterVO {
        private Long projectId;
        private Long memberId;
        private LocalDate startDate;
        private LocalDate endDate;
    }

    @Data
    public static class OptionVO {
        private Long id;
        private String name;
    }

    @Data
    public static class SummaryVO {
        private Integer taskCount;
        private Integer doneTaskCount;
        private Integer pendingTaskCount;
        private Integer overdueTaskCount;
        private Integer dueSoonTaskCount;
        private Integer completionRate;
        private Integer overdueRate;
        private Integer riskTaskCount;
        private Integer memberCount;
        private Integer activeProjectCount;
        private Integer recurringPlanCount;
        private Integer recurringOccurrenceCount;
        private Integer recurringExecutedCount;
        private Integer recurringCompletedCount;
        private Integer recurringExecutionRate;
        private Integer recurringCompletionRate;
    }

    @Data
    public static class ProjectMetricVO {
        private Long projectId;
        private String projectName;
        private String ownerName;
        private Integer progress;
        private Integer healthScore;
        private String healthLevel;
        private Integer taskCount;
        private Integer doneTaskCount;
        private Integer pendingTaskCount;
        private Integer overdueTaskCount;
        private Integer dueSoonTaskCount;
        private Integer highPriorityRiskCount;
        private Integer completionRate;
        private Integer overdueRate;
        private Integer memberCount;
        private Integer recurringPlanCount;
        private Integer recurringExecutionRate;
        private LocalDateTime lastActivityAt;
    }

    @Data
    public static class MemberWorkloadVO {
        private Long memberId;
        private String memberName;
        private Integer taskCount;
        private Integer doneTaskCount;
        private Integer pendingTaskCount;
        private Integer overdueTaskCount;
        private Integer dueSoonTaskCount;
        private Integer highPriorityCount;
        private Integer recurringPendingCount;
        private Integer completionRate;
        private Integer workloadScore;
        private String riskLevel;
    }

    @Data
    public static class RecurringPlanMetricVO {
        private Long planId;
        private String title;
        private Long projectId;
        private String projectName;
        private String status;
        private String assigneeNames;
        private LocalDateTime nextRunAt;
        private Integer occurrenceCount;
        private Integer executedCount;
        private Integer completedCount;
        private Integer pendingCount;
        private Integer overdueCount;
        private Integer executionRate;
        private Integer completionRate;
    }
}
