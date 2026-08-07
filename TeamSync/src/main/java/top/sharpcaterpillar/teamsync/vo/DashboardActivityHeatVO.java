package top.sharpcaterpillar.teamsync.vo;

/**
 * 活跃热度数据。
 */
public class DashboardActivityHeatVO {

    private String date;
    private Integer count;

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public Integer getCount() {
        return count;
    }

    public void setCount(Integer count) {
        this.count = count;
    }
}
