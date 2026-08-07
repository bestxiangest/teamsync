package top.sharpcaterpillar.teamsync.dto;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 周期计划查询请求。
 */
@Data
public class RecurringPlanQueryRequest {

    private Integer current = 1;

    private Integer size = 10;

    private String keyword;

    private String status;

    private String recurrenceUnit;

    /**
     * 仅平台管理员可按创建人过滤；普通用户始终只查询自己创建的计划。
     */
    private Long creatorId;

    private LocalDateTime nextRunStart;

    private LocalDateTime nextRunEnd;
}
