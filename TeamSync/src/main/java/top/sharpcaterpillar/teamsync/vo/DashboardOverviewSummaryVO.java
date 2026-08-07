package top.sharpcaterpillar.teamsync.vo;

/**
 * 平台总览顶部汇总指标。
 */
public class DashboardOverviewSummaryVO {

    private Integer projectCount;
    private Integer taskCount;
    private Integer doneTaskCount;
    private Integer pendingTaskCount;
    private Integer overdueTaskCount;
    private Integer completionRate;
    private Integer memberCount;
    private Integer commentCount;
    private Integer activityCount7d;
    private Integer healthyProjectCount;
    private Integer warningProjectCount;
    private Integer riskProjectCount;
    private Integer averageProgress;

    public Integer getProjectCount() {
        return projectCount;
    }

    public void setProjectCount(Integer projectCount) {
        this.projectCount = projectCount;
    }

    public Integer getTaskCount() {
        return taskCount;
    }

    public void setTaskCount(Integer taskCount) {
        this.taskCount = taskCount;
    }

    public Integer getDoneTaskCount() {
        return doneTaskCount;
    }

    public void setDoneTaskCount(Integer doneTaskCount) {
        this.doneTaskCount = doneTaskCount;
    }

    public Integer getPendingTaskCount() {
        return pendingTaskCount;
    }

    public void setPendingTaskCount(Integer pendingTaskCount) {
        this.pendingTaskCount = pendingTaskCount;
    }

    public Integer getOverdueTaskCount() {
        return overdueTaskCount;
    }

    public void setOverdueTaskCount(Integer overdueTaskCount) {
        this.overdueTaskCount = overdueTaskCount;
    }

    public Integer getCompletionRate() {
        return completionRate;
    }

    public void setCompletionRate(Integer completionRate) {
        this.completionRate = completionRate;
    }

    public Integer getMemberCount() {
        return memberCount;
    }

    public void setMemberCount(Integer memberCount) {
        this.memberCount = memberCount;
    }

    public Integer getCommentCount() {
        return commentCount;
    }

    public void setCommentCount(Integer commentCount) {
        this.commentCount = commentCount;
    }

    public Integer getActivityCount7d() {
        return activityCount7d;
    }

    public void setActivityCount7d(Integer activityCount7d) {
        this.activityCount7d = activityCount7d;
    }

    public Integer getHealthyProjectCount() {
        return healthyProjectCount;
    }

    public void setHealthyProjectCount(Integer healthyProjectCount) {
        this.healthyProjectCount = healthyProjectCount;
    }

    public Integer getWarningProjectCount() {
        return warningProjectCount;
    }

    public void setWarningProjectCount(Integer warningProjectCount) {
        this.warningProjectCount = warningProjectCount;
    }

    public Integer getRiskProjectCount() {
        return riskProjectCount;
    }

    public void setRiskProjectCount(Integer riskProjectCount) {
        this.riskProjectCount = riskProjectCount;
    }

    public Integer getAverageProgress() {
        return averageProgress;
    }

    public void setAverageProgress(Integer averageProgress) {
        this.averageProgress = averageProgress;
    }
}
