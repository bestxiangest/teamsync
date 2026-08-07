package top.sharpcaterpillar.teamsync.vo;

/**
 * 控制台洞察数据。
 */
public class DashboardInsightVO {

    private Integer overdueTaskCount;
    private Integer dueSoonTaskCount;
    private Integer completionRate;
    private Integer activeProjectCount;
    private Integer activityCount7d;

    public Integer getOverdueTaskCount() {
        return overdueTaskCount;
    }

    public void setOverdueTaskCount(Integer overdueTaskCount) {
        this.overdueTaskCount = overdueTaskCount;
    }

    public Integer getDueSoonTaskCount() {
        return dueSoonTaskCount;
    }

    public void setDueSoonTaskCount(Integer dueSoonTaskCount) {
        this.dueSoonTaskCount = dueSoonTaskCount;
    }

    public Integer getCompletionRate() {
        return completionRate;
    }

    public void setCompletionRate(Integer completionRate) {
        this.completionRate = completionRate;
    }

    public Integer getActiveProjectCount() {
        return activeProjectCount;
    }

    public void setActiveProjectCount(Integer activeProjectCount) {
        this.activeProjectCount = activeProjectCount;
    }

    public Integer getActivityCount7d() {
        return activityCount7d;
    }

    public void setActivityCount7d(Integer activityCount7d) {
        this.activityCount7d = activityCount7d;
    }
}
