package top.sharpcaterpillar.teamsync.vo;

import java.util.ArrayList;
import java.util.List;

/**
 * 平台总览数据。
 */
public class DashboardOverviewVO {

    private DashboardOverviewSummaryVO summary;
    private List<DashboardTaskTrendVO> platformTrend7d = new ArrayList<>();
    private List<DashboardActivityHeatVO> activityHeat7d = new ArrayList<>();
    private List<DashboardPriorityDistributionVO> priorityDistribution = new ArrayList<>();
    private List<DashboardOverviewHealthVO> healthDistribution = new ArrayList<>();
    private List<DashboardOverviewProjectVO> projects = new ArrayList<>();

    public DashboardOverviewSummaryVO getSummary() {
        return summary;
    }

    public void setSummary(DashboardOverviewSummaryVO summary) {
        this.summary = summary;
    }

    public List<DashboardTaskTrendVO> getPlatformTrend7d() {
        return platformTrend7d;
    }

    public void setPlatformTrend7d(List<DashboardTaskTrendVO> platformTrend7d) {
        this.platformTrend7d = platformTrend7d;
    }

    public List<DashboardActivityHeatVO> getActivityHeat7d() {
        return activityHeat7d;
    }

    public void setActivityHeat7d(List<DashboardActivityHeatVO> activityHeat7d) {
        this.activityHeat7d = activityHeat7d;
    }

    public List<DashboardPriorityDistributionVO> getPriorityDistribution() {
        return priorityDistribution;
    }

    public void setPriorityDistribution(List<DashboardPriorityDistributionVO> priorityDistribution) {
        this.priorityDistribution = priorityDistribution;
    }

    public List<DashboardOverviewHealthVO> getHealthDistribution() {
        return healthDistribution;
    }

    public void setHealthDistribution(List<DashboardOverviewHealthVO> healthDistribution) {
        this.healthDistribution = healthDistribution;
    }

    public List<DashboardOverviewProjectVO> getProjects() {
        return projects;
    }

    public void setProjects(List<DashboardOverviewProjectVO> projects) {
        this.projects = projects;
    }
}
