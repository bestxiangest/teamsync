package top.sharpcaterpillar.teamsync.dto;

import lombok.Data;

/**
 * 周期计划执行记录查询请求。
 */
@Data
public class RecurringPlanOccurrenceQueryRequest {

    private Integer current = 1;

    private Integer size = 20;

    private String status;
}
