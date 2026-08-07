package top.sharpcaterpillar.teamsync.vo;

/**
 * 近 7 日任务趋势。
 */
public class DashboardTaskTrendVO {

    private String date;
    private Integer createdCount;
    private Integer completedCount;
    private Integer overdueCount;

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public Integer getCreatedCount() {
        return createdCount;
    }

    public void setCreatedCount(Integer createdCount) {
        this.createdCount = createdCount;
    }

    public Integer getCompletedCount() {
        return completedCount;
    }

    public void setCompletedCount(Integer completedCount) {
        this.completedCount = completedCount;
    }

    public Integer getOverdueCount() {
        return overdueCount;
    }

    public void setOverdueCount(Integer overdueCount) {
        this.overdueCount = overdueCount;
    }
}
