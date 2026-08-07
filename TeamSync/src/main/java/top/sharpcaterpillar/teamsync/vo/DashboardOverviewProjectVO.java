package top.sharpcaterpillar.teamsync.vo;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * 平台总览中的项目明细。
 */
public class DashboardOverviewProjectVO {

    private Long projectId;
    private String name;
    private String description;
    private String ownerName;
    private Integer progress;
    private Integer healthScore;
    private String healthLevel;
    private Integer taskCount;
    private Integer doneCount;
    private Integer pendingCount;
    private Integer overdueCount;
    private Integer completionRate;
    private Integer memberCount;
    private Integer commentCount;
    private Integer activityCount7d;
    private Integer highPriorityCount;
    private Integer mediumPriorityCount;
    private Integer normalPriorityCount;
    private LocalDateTime lastActivityAt;
    private LocalDateTime updatedAt;
    private List<DashboardTaskTrendVO> trend7d = new ArrayList<>();
    private List<DashboardPriorityDistributionVO> priorityDistribution = new ArrayList<>();

    public Long getProjectId() {
        return projectId;
    }

    public void setProjectId(Long projectId) {
        this.projectId = projectId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getOwnerName() {
        return ownerName;
    }

    public void setOwnerName(String ownerName) {
        this.ownerName = ownerName;
    }

    public Integer getProgress() {
        return progress;
    }

    public void setProgress(Integer progress) {
        this.progress = progress;
    }

    public Integer getHealthScore() {
        return healthScore;
    }

    public void setHealthScore(Integer healthScore) {
        this.healthScore = healthScore;
    }

    public String getHealthLevel() {
        return healthLevel;
    }

    public void setHealthLevel(String healthLevel) {
        this.healthLevel = healthLevel;
    }

    public Integer getTaskCount() {
        return taskCount;
    }

    public void setTaskCount(Integer taskCount) {
        this.taskCount = taskCount;
    }

    public Integer getDoneCount() {
        return doneCount;
    }

    public void setDoneCount(Integer doneCount) {
        this.doneCount = doneCount;
    }

    public Integer getPendingCount() {
        return pendingCount;
    }

    public void setPendingCount(Integer pendingCount) {
        this.pendingCount = pendingCount;
    }

    public Integer getOverdueCount() {
        return overdueCount;
    }

    public void setOverdueCount(Integer overdueCount) {
        this.overdueCount = overdueCount;
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

    public Integer getHighPriorityCount() {
        return highPriorityCount;
    }

    public void setHighPriorityCount(Integer highPriorityCount) {
        this.highPriorityCount = highPriorityCount;
    }

    public Integer getMediumPriorityCount() {
        return mediumPriorityCount;
    }

    public void setMediumPriorityCount(Integer mediumPriorityCount) {
        this.mediumPriorityCount = mediumPriorityCount;
    }

    public Integer getNormalPriorityCount() {
        return normalPriorityCount;
    }

    public void setNormalPriorityCount(Integer normalPriorityCount) {
        this.normalPriorityCount = normalPriorityCount;
    }

    public LocalDateTime getLastActivityAt() {
        return lastActivityAt;
    }

    public void setLastActivityAt(LocalDateTime lastActivityAt) {
        this.lastActivityAt = lastActivityAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public List<DashboardTaskTrendVO> getTrend7d() {
        return trend7d;
    }

    public void setTrend7d(List<DashboardTaskTrendVO> trend7d) {
        this.trend7d = trend7d;
    }

    public List<DashboardPriorityDistributionVO> getPriorityDistribution() {
        return priorityDistribution;
    }

    public void setPriorityDistribution(List<DashboardPriorityDistributionVO> priorityDistribution) {
        this.priorityDistribution = priorityDistribution;
    }
}
