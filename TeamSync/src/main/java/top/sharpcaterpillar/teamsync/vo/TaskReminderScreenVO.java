package top.sharpcaterpillar.teamsync.vo;

import java.util.List;

/**
 * 任务提醒大屏公开数据。
 */
public class TaskReminderScreenVO {

    private List<KpiCardItemVO> summaryCards;
    private List<KpiCardItemVO> managementSnapshotCards;
    private List<UrgentTaskItemVO> urgentTasks;
    private List<TimelineTaskItemVO> todayTimeline;
    private List<ProjectRiskItemVO> projectRisks;
    private List<RecurringPlanReminderItemVO> recurringPlans;
    private List<KpiCardItemVO> assigneeSummaryCards;
    private List<AssigneeOverviewItemVO> assigneeWall;
    private List<WorkloadRankingItemVO> workloadRanking;
    private List<CollaborationReminderItemVO> collaborationReminders;
    private List<KpiCardItemVO> sevenDaySummaryCards;
    private List<CalendarDayItemVO> sevenDayCalendar;
    private List<DailyFocusItemVO> dailyFocus;
    private List<ProjectMilestoneItemVO> milestoneCards;

    public List<KpiCardItemVO> getSummaryCards() {
        return summaryCards;
    }

    public void setSummaryCards(List<KpiCardItemVO> summaryCards) {
        this.summaryCards = summaryCards;
    }

    public List<KpiCardItemVO> getManagementSnapshotCards() {
        return managementSnapshotCards;
    }

    public void setManagementSnapshotCards(List<KpiCardItemVO> managementSnapshotCards) {
        this.managementSnapshotCards = managementSnapshotCards;
    }

    public List<UrgentTaskItemVO> getUrgentTasks() {
        return urgentTasks;
    }

    public void setUrgentTasks(List<UrgentTaskItemVO> urgentTasks) {
        this.urgentTasks = urgentTasks;
    }

    public List<TimelineTaskItemVO> getTodayTimeline() {
        return todayTimeline;
    }

    public void setTodayTimeline(List<TimelineTaskItemVO> todayTimeline) {
        this.todayTimeline = todayTimeline;
    }

    public List<ProjectRiskItemVO> getProjectRisks() {
        return projectRisks;
    }

    public void setProjectRisks(List<ProjectRiskItemVO> projectRisks) {
        this.projectRisks = projectRisks;
    }

    public List<RecurringPlanReminderItemVO> getRecurringPlans() {
        return recurringPlans;
    }

    public void setRecurringPlans(List<RecurringPlanReminderItemVO> recurringPlans) {
        this.recurringPlans = recurringPlans;
    }

    public List<KpiCardItemVO> getAssigneeSummaryCards() {
        return assigneeSummaryCards;
    }

    public void setAssigneeSummaryCards(List<KpiCardItemVO> assigneeSummaryCards) {
        this.assigneeSummaryCards = assigneeSummaryCards;
    }

    public List<AssigneeOverviewItemVO> getAssigneeWall() {
        return assigneeWall;
    }

    public void setAssigneeWall(List<AssigneeOverviewItemVO> assigneeWall) {
        this.assigneeWall = assigneeWall;
    }

    public List<WorkloadRankingItemVO> getWorkloadRanking() {
        return workloadRanking;
    }

    public void setWorkloadRanking(List<WorkloadRankingItemVO> workloadRanking) {
        this.workloadRanking = workloadRanking;
    }

    public List<CollaborationReminderItemVO> getCollaborationReminders() {
        return collaborationReminders;
    }

    public void setCollaborationReminders(List<CollaborationReminderItemVO> collaborationReminders) {
        this.collaborationReminders = collaborationReminders;
    }

    public List<KpiCardItemVO> getSevenDaySummaryCards() {
        return sevenDaySummaryCards;
    }

    public void setSevenDaySummaryCards(List<KpiCardItemVO> sevenDaySummaryCards) {
        this.sevenDaySummaryCards = sevenDaySummaryCards;
    }

    public List<CalendarDayItemVO> getSevenDayCalendar() {
        return sevenDayCalendar;
    }

    public void setSevenDayCalendar(List<CalendarDayItemVO> sevenDayCalendar) {
        this.sevenDayCalendar = sevenDayCalendar;
    }

    public List<DailyFocusItemVO> getDailyFocus() {
        return dailyFocus;
    }

    public void setDailyFocus(List<DailyFocusItemVO> dailyFocus) {
        this.dailyFocus = dailyFocus;
    }

    public List<ProjectMilestoneItemVO> getMilestoneCards() {
        return milestoneCards;
    }

    public void setMilestoneCards(List<ProjectMilestoneItemVO> milestoneCards) {
        this.milestoneCards = milestoneCards;
    }

    public record KpiCardItemVO(String id,
                                String label,
                                Integer value,
                                String trendText,
                                String trendDirection,
                                String tone,
                                String icon) {
    }

    public record UrgentTaskItemVO(Long id,
                                   String taskName,
                                   String projectName,
                                   String assigneeName,
                                   String priority,
                                   String priorityLevel,
                                   String remainingTime,
                                   String status) {
    }

    public record TimelineTaskItemVO(Long id,
                                     String time,
                                     String taskName,
                                     String countdownText,
                                     String status) {
    }

    public record ProjectRiskItemVO(Long id,
                                    String projectName,
                                    Integer progress,
                                    Integer overdueTaskCount,
                                    String riskLevel,
                                    String riskText) {
    }

    public record RecurringPlanReminderItemVO(Long id,
                                              String planName,
                                              String cycle,
                                              String nextRunTime,
                                              String assigneeName,
                                              String dueTime,
                                              String status) {
    }

    public record AssigneeTaskItemVO(Long id,
                                     String title,
                                     String status) {
    }

    public record AssigneeOverviewItemVO(Long id,
                                         String name,
                                         String position,
                                         String department,
                                         Integer completionRate,
                                         Integer todoCount,
                                         Integer todayDueCount,
                                         Integer overdueCount,
                                         List<AssigneeTaskItemVO> tasks) {
    }

    public record WorkloadRankingItemVO(Integer rank,
                                        String name,
                                        Integer todoCount,
                                        Integer todayDueCount,
                                        Integer overdueCount,
                                        String riskLevel,
                                        String riskText) {
    }

    public record CollaborationReminderItemVO(Long id,
                                              String projectName,
                                              String blocker,
                                              String people,
                                              String urgency,
                                              String urgencyText) {
    }

    public record CalendarTaskChipItemVO(Long id,
                                         String title,
                                         String type,
                                         String status) {
    }

    public record CalendarDayItemVO(Long id,
                                    String weekday,
                                    String dateText,
                                    List<CalendarTaskChipItemVO> tasks,
                                    Integer totalCount) {
    }

    public record DailyFocusItemVO(Long id,
                                   String dateText,
                                   String taskName,
                                   String assigneeName,
                                   String countdownText,
                                   String status) {
    }

    public record ProjectMilestoneItemVO(Long id,
                                         String projectName,
                                         String milestoneName,
                                         String expectedDate,
                                         Integer readiness,
                                         String riskLevel,
                                         String riskText,
                                         String tone) {
    }
}
