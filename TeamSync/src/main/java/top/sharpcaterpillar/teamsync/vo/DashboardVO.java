package top.sharpcaterpillar.teamsync.vo;

import java.util.ArrayList;
import java.util.List;

/**
 * 控制台工作台总览数据。
 */
public class DashboardVO {

    private DashboardStatsVO stats;
    private List<DashboardTaskVO> myTasks = new ArrayList<>();
    private List<DashboardActivityVO> activities = new ArrayList<>();
    private List<DashboardProjectVO> projects = new ArrayList<>();
    private DashboardInsightVO insight;
    private List<DashboardTaskTrendVO> taskTrend7d = new ArrayList<>();
    private List<DashboardPriorityDistributionVO> priorityDistribution = new ArrayList<>();
    private List<DashboardActivityHeatVO> activityHeat7d = new ArrayList<>();
    private List<DashboardProjectHealthVO> projectHealth = new ArrayList<>();

    public DashboardStatsVO getStats() {
        return stats;
    }

    public void setStats(DashboardStatsVO stats) {
        this.stats = stats;
    }

    public List<DashboardTaskVO> getMyTasks() {
        return myTasks;
    }

    public void setMyTasks(List<DashboardTaskVO> myTasks) {
        this.myTasks = myTasks;
    }

    public List<DashboardActivityVO> getActivities() {
        return activities;
    }

    public void setActivities(List<DashboardActivityVO> activities) {
        this.activities = activities;
    }

    public List<DashboardProjectVO> getProjects() {
        return projects;
    }

    public void setProjects(List<DashboardProjectVO> projects) {
        this.projects = projects;
    }

    public DashboardInsightVO getInsight() {
        return insight;
    }

    public void setInsight(DashboardInsightVO insight) {
        this.insight = insight;
    }

    public List<DashboardTaskTrendVO> getTaskTrend7d() {
        return taskTrend7d;
    }

    public void setTaskTrend7d(List<DashboardTaskTrendVO> taskTrend7d) {
        this.taskTrend7d = taskTrend7d;
    }

    public List<DashboardPriorityDistributionVO> getPriorityDistribution() {
        return priorityDistribution;
    }

    public void setPriorityDistribution(List<DashboardPriorityDistributionVO> priorityDistribution) {
        this.priorityDistribution = priorityDistribution;
    }

    public List<DashboardActivityHeatVO> getActivityHeat7d() {
        return activityHeat7d;
    }

    public void setActivityHeat7d(List<DashboardActivityHeatVO> activityHeat7d) {
        this.activityHeat7d = activityHeat7d;
    }

    public List<DashboardProjectHealthVO> getProjectHealth() {
        return projectHealth;
    }

    public void setProjectHealth(List<DashboardProjectHealthVO> projectHealth) {
        this.projectHealth = projectHealth;
    }
}
