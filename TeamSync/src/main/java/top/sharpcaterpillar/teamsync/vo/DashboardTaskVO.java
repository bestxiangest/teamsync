package top.sharpcaterpillar.teamsync.vo;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 工作台任务 VO（我的待办）
 */
public class DashboardTaskVO {

    /**
     * 任务ID
     */
    private Long id;

    /**
     * 任务标题
     */
    private String title;

    /**
     * 优先级 1:普通 2:紧急 3:非常紧急
     */
    private Integer priority;

    /**
     * 截止时间
     */
    private LocalDateTime dueTime;

    /**
     * 所属项目ID
     */
    private Long projectId;

    /**
     * 所属项目名称
     */
    private String projectName;

    /**
     * 所属阶段名称
     */
    private String stageName;

    /**
     * 来源类型：PROJECT_TASK / RECURRING_PLAN
     */
    private String sourceType;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public Integer getPriority() {
        return priority;
    }

    public void setPriority(Integer priority) {
        this.priority = priority;
    }

    public LocalDateTime getDueTime() {
        return dueTime;
    }

    public void setDueTime(LocalDateTime dueTime) {
        this.dueTime = dueTime;
    }

    public Long getProjectId() {
        return projectId;
    }

    public void setProjectId(Long projectId) {
        this.projectId = projectId;
    }

    public String getProjectName() {
        return projectName;
    }

    public void setProjectName(String projectName) {
        this.projectName = projectName;
    }

    public String getStageName() {
        return stageName;
    }

    public void setStageName(String stageName) {
        this.stageName = stageName;
    }

    public String getSourceType() {
        return sourceType;
    }

    public void setSourceType(String sourceType) {
        this.sourceType = sourceType;
    }
}
