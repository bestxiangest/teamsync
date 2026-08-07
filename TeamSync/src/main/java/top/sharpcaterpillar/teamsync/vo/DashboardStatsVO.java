package top.sharpcaterpillar.teamsync.vo;

import lombok.Data;

/**
 * 工作台统计数据 VO
 */
public class DashboardStatsVO {

    /**
     * 待办任务数（我负责的未完成任务）
     */
    private Integer pendingTaskCount;

    /**
     * 参与项目数
     */
    private Integer projectCount;

    /**
     * 我的评论数
     */
    private Integer totalCommentCount;

    /**
     * 已完成任务数
     */
    private Integer doneTaskCount;

    public Integer getPendingTaskCount() {
        return pendingTaskCount;
    }

    public void setPendingTaskCount(Integer pendingTaskCount) {
        this.pendingTaskCount = pendingTaskCount;
    }

    public Integer getProjectCount() {
        return projectCount;
    }

    public void setProjectCount(Integer projectCount) {
        this.projectCount = projectCount;
    }

    public Integer getTotalCommentCount() {
        return totalCommentCount;
    }

    public void setTotalCommentCount(Integer totalCommentCount) {
        this.totalCommentCount = totalCommentCount;
    }

    public Integer getDoneTaskCount() {
        return doneTaskCount;
    }

    public void setDoneTaskCount(Integer doneTaskCount) {
        this.doneTaskCount = doneTaskCount;
    }
}

