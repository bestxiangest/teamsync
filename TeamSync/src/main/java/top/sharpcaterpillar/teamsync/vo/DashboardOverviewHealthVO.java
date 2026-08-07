package top.sharpcaterpillar.teamsync.vo;

/**
 * 平台项目健康度分布项。
 */
public class DashboardOverviewHealthVO {

    private String status;
    private String label;
    private Integer count;

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
    }

    public Integer getCount() {
        return count;
    }

    public void setCount(Integer count) {
        this.count = count;
    }
}
