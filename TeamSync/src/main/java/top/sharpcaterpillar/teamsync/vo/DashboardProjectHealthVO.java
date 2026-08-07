package top.sharpcaterpillar.teamsync.vo;

/**
 * 项目健康度卡片数据。
 */
public class DashboardProjectHealthVO {

    private Long projectId;
    private String name;
    private String role;
    private Integer progress;
    private Integer pendingCount;
    private Integer doneCount;
    private Integer overdueCount;

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

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public Integer getProgress() {
        return progress;
    }

    public void setProgress(Integer progress) {
        this.progress = progress;
    }

    public Integer getPendingCount() {
        return pendingCount;
    }

    public void setPendingCount(Integer pendingCount) {
        this.pendingCount = pendingCount;
    }

    public Integer getDoneCount() {
        return doneCount;
    }

    public void setDoneCount(Integer doneCount) {
        this.doneCount = doneCount;
    }

    public Integer getOverdueCount() {
        return overdueCount;
    }

    public void setOverdueCount(Integer overdueCount) {
        this.overdueCount = overdueCount;
    }
}
