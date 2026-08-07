package top.sharpcaterpillar.teamsync.dto;

import lombok.Data;

/**
 * 周期计划状态更新请求。
 */
@Data
public class RecurringPlanStatusRequest {

    /**
     * ACTIVE/PAUSED/FINISHED。
     */
    private String status;
}
